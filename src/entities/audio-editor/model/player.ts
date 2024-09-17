import { EventEmitter } from 'eventemitter3';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

import { clamp, Timer } from '@/shared/lib';
import { IS_DEBUG_LEVEL_INFO } from '@/shared/model';

import {
  AudioEditorChannelState,
  Channel,
  TRACK_COLORS,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { Playlist } from '@/entities/playlist';
import {
  AudioEditorTrack,
  AudioEditorTrackState,
  calculatePeaks,
  ObserverTrackLoader,
  Track,
  TrackData,
  TrackLoader,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/track';

import { ObservableRegion, Region } from './region';
import { trackColorsGenerator } from './trackColorsGenerator';

export type TimeListener = (time: number) => void;

export interface PlayerState {
  channels: AudioEditorChannelState[];
  tracks: AudioEditorTrackState[];
}

export interface PlayerEvents {
  ready: void;
  timeupdate: number;
}

export interface Player {
  readonly events: EventEmitter<PlayerEvents>;

  readonly channels: Channel[];
  readonly tracks: AudioEditorTrack[];
  readonly tracksSortedByStartTime: AudioEditorTrack[];
  readonly tracksByAudioUuid: Map<string, AudioEditorTrack>;
  readonly playlist: Playlist | null;
  readonly trackLoader: TrackLoader;

  readonly region: Region;

  readonly time: number;
  readonly isPlaying: boolean;
  readonly loadingStatus: LoadingStatus;

  readonly duration: number;

  importPlaylist(playlists: Playlist): void;

  importTrack(track: Track, channelIndex?: number): void;
  removeTrack(track: AudioEditorTrack, dispose?: boolean): void;

  loadTracks(withPeaks?: boolean): Promise<void>;

  play(): void;
  stop(): void;

  setTime(value: number): void;

  addChannel(channel?: Channel): void;
  removeChannel(channel: Channel): void;
  isChannelMuted(channel: Channel): boolean;
  isChannelSolo(channel: Channel): boolean;

  clear(): void;

  getState(): PlayerState;
  restoreState(state: PlayerState): void;

  hydration(playlists: Playlist): Promise<void>;
}

type LoadingStatus = 'empty' | 'loading' | 'fulfilled';

export class ObservablePlayer implements Player {
  readonly events = new EventEmitter<PlayerEvents>();

  private _colorsGenerator = trackColorsGenerator(TRACK_COLORS);

  readonly channels = observable.array<Channel>();
  readonly region: Region = new ObservableRegion();
  readonly trackLoader: TrackLoader = new ObserverTrackLoader();

  private _playlist: Playlist | null = null;

  private _timer: Timer | null = null;
  private _time = 0;
  private _isPlaying = false;
  private _loadingStatus: LoadingStatus = 'empty';

  get playlist(): Playlist | null {
    return this._playlist;
  }

  get duration(): number {
    return this.playlist?.duration_in_seconds ?? 0;
  }

  get time() {
    return this._time;
  }
  set time(value: number) {
    this.setTime(value);
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get loadingStatus(): LoadingStatus {
    return this._loadingStatus;
  }

  get tracksByAudioUuid(): Map<string, AudioEditorTrack> {
    return this.tracks.reduce(
      (acc, track) => acc.set(track.meta.uuid, track),
      new Map(),
    );
  }

  get tracks(): AudioEditorTrack[] {
    return this.channels.flatMap((channel) => channel.tracks);
  }

  get tracksSortedByStartTime(): AudioEditorTrack[] {
    return this.tracks.sort((a, b) => a.startTime - b.startTime);
  }

  private get _soloChannels(): Channel[] {
    return this.channels.filter((channel) => channel.isSolo);
  }

  constructor(playlist?: Playlist) {
    this._timer = new Timer((time: number) => this._onTimeUpdate(time / 1000));

    this.addChannel();
    this.addChannel();

    if (playlist) {
      this.importPlaylist(playlist);
    }

    makeAutoObservable<ObservablePlayer, '_soloChannels'>(this, {
      _soloChannels: computed,
      time: computed,
      isPlaying: computed,
    });
  }

  importPlaylist = (playlist: Playlist): void => {
    this.clear();
    this.trackLoader.clearData();

    this.addChannel();
    this.addChannel();

    playlist.tracks.forEach((track, i) =>
      this.channels[i % 2]?.importTrack(track),
    );

    this._playlist = playlist;
  };

  importTrack = (track: Track, channelIndex?: number): void => {
    const index = this.tracks.length;

    if (channelIndex && channelIndex >= this.channels.length) {
      this.addChannel();
    }

    this.channels[channelIndex ?? index % 2]?.importTrack(track);
  };

  removeTrack = (track: AudioEditorTrack, dispose: boolean = false): void => {
    track.channel.removeTrack(track);
    if (dispose) {
      track.dispose();
    }
    // if (this.playlist !== null) {
    //   console.log(this.playlist.duration);
    //   console.log(this.playlist.tracks);
    //   this.playlist.tracks = this.playlist.tracks.filter(
    //     (tr) => tr.uuid !== track.meta.uuid,
    //   );
    //   this.playlist.duration_in_seconds -= getPlaylistMaxTime(this.playlist);
    //   console.log(this.playlist.duration);
    //   console.log(this.playlist.tracks);
    // }
  };

  loadTracks = async (withPeaks: boolean = true): Promise<void> => {
    if (!this._playlist) {
      return;
    }

    const onTrackLoad = (trackData: TrackData) => {
      if (!trackData.objectUrl || !trackData.blob) {
        return;
      }

      const track = this.tracksByAudioUuid.get(trackData.uuid);
      if (!track) {
        return;
      }
      track.load(trackData.objectUrl);

      if (withPeaks) {
        const generateAndSetPeaks = async () => {
          if (!trackData.arrayBuffer) {
            track.setPeaks([]);
            return;
          }

          const peaks = await calculatePeaks(trackData.arrayBuffer);

          track.setPeaks(peaks);
        };

        generateAndSetPeaks();
      }

      const onLoad = () => {
        runInAction(() => {
          if (
            this.tracks.every((track) => track.mediaElement.readyState === 4)
          ) {
            if (IS_DEBUG_LEVEL_INFO) {
              // eslint-disable-next-line no-console
              console.info('Player: all tracks loaded');
            }

            this._loadingStatus = 'fulfilled';
            this.events.emit('ready');
          }
        });

        track.mediaElement.removeEventListener('loadeddata', onLoad);
      };

      track.mediaElement.addEventListener('loadeddata', onLoad);
    };

    runInAction(() => {
      this._loadingStatus = 'loading';
    });

    await this.trackLoader.downloadTracks(this._playlist.tracks, onTrackLoad);
  };

  //#region Player actions
  play = () => {
    if (this._isPlaying) {
      return;
    }

    this._isPlaying = true;
    this._timer?.start();
  };

  stop = () => {
    if (!this._isPlaying) {
      return;
    }

    this._isPlaying = false;
    this._timer?.pause();

    this._processTracks(this.time, (_: number, track: AudioEditorTrack) =>
      track.audioBuffer?.pause(),
    );
  };

  setTime = (time: number) => {
    const newTime = clamp(
      time,
      0,
      this.playlist?.duration_in_seconds ?? Infinity,
    );
    this._time = newTime;
    this._timer?.setTime(newTime * 1000);
    this.events.emit('timeupdate', newTime);

    this._processTracks(time, (_: number, track: AudioEditorTrack) => {
      if (!track.audioBuffer) {
        return;
      }

      if (this._isTimeInTrackBounds(time, track)) {
        const trackTime = time - track.startTime;
        track.audioBuffer.setTime(trackTime);
      }
    });
  };

  //#endregion

  //#region Channel actions
  addChannel = (channel: Channel = new Channel()) => {
    channel.colorsGenerator = this._colorsGenerator;
    this.channels.push(channel);
  };

  removeChannel = (channel: Channel) => {
    channel.dispose();
    this.channels.remove(channel);
  };

  isChannelMuted(channel: Channel): boolean {
    return (
      channel.isMuted ||
      (this._soloChannels.length > 0 && !this._soloChannels.includes(channel))
    );
  }

  isChannelSolo(channel: Channel): boolean {
    return channel.isSolo;
  }
  //#endregion

  clear = () => {
    this._loadingStatus = 'empty';

    this.stop();

    this.channels.forEach((channel) => channel.dispose());
    this.channels.clear();

    this.setTime(0);
  };

  on(event: keyof PlayerEvents, listener: TimeListener): void {
    this.events.on(event, listener);
  }

  off(event: keyof PlayerEvents, listener: TimeListener): void {
    this.events.off(event, listener);
  }

  private _onTimeUpdate = (time: number) => {
    if (
      this.playlist?.duration_in_seconds &&
      time >= this.playlist?.duration_in_seconds
    ) {
      this.stop();
      return;
    }

    this._time = time;
    this._process(time);
    this.events.emit('timeupdate', time);
  };

  private _process = (time: number) => {
    if (!this.isPlaying) {
      return;
    }

    if (
      this.region.isEnabled &&
      (this.time > this.region.end || this.time < this.region.start)
    ) {
      this.setTime(this.region.start);
    }

    this._processTracks(time, this._processTrack);
  };

  private _processTracks = (
    time: number,
    callback: (time: number, track: AudioEditorTrack) => void,
  ) => {
    this.channels.forEach((channel) =>
      channel.tracks.forEach((track) => callback(time, track)),
    );
  };

  private _processTrack = (time: number, track: AudioEditorTrack) => {
    if (!track.audioBuffer) {
      return;
    }

    if (!this._isTimeInTrackBounds(time, track)) {
      if (track.audioBuffer.isPlaying()) {
        track.audioBuffer.pause();
      }
      return;
    }

    const isChannelMuted = this.isChannelMuted(track.channel);
    const isPlaying = track.audioBuffer.isPlaying();

    if (!isChannelMuted && !isPlaying) {
      const trackTime = time - track.startTime;
      track.audioBuffer.setTime(trackTime);
      track.audioBuffer.play();
    } else if (isChannelMuted && isPlaying) {
      track.audioBuffer.pause();
    }
  };

  private _isTimeInTrackBounds = (time: number, track: AudioEditorTrack) => {
    return time >= track.trimStartTime && time < track.trimEndTime;
  };

  getState(): PlayerState {
    return {
      channels: this.channels.map<AudioEditorChannelState>((channel) =>
        channel.getState(),
      ),
      tracks: this.tracks.map<AudioEditorTrackState>((track) =>
        track.getState(),
      ),
    };
  }

  restoreState = (state: PlayerState) => {
    const stateTracksIds = state.tracks.map((track) => track.uuid);

    const tracks = [...this.tracks].filter((track) =>
      stateTracksIds.includes(track.id),
    );

    const channels = state.channels.map((channelState) => {
      const newChannel = new Channel(channelState.id);
      newChannel.restoreState(channelState);
      return newChannel;
    });

    this.channels.replace(channels);

    state.tracks.forEach((trackState) =>
      runInAction(() => {
        const foundTrack = tracks.find((track) => track.id === trackState.uuid);

        const foundChannel = this.channels.find(
          (channel) => channel.id === trackState.channelId,
        )!;

        if (!foundTrack) {
          const newTrack = new AudioEditorTrack(trackState.meta, foundChannel);

          newTrack.restoreState(trackState);

          tracks.push(newTrack);
          return;
        }

        foundTrack.channel = foundChannel;

        foundTrack.restoreState(trackState);
      }),
    );

    tracks.forEach((track) => {
      track.channel.addTrack(track);
    });
  };

  hydration = async (playlist: Playlist): Promise<void> => {
    runInAction(() => {
      this._playlist = playlist;

      // Add new tracks from playlist
      playlist.tracks.forEach((track) => {
        const existingTrack = this.tracksByAudioUuid.get(track.uuid);

        if (existingTrack !== undefined) {
          existingTrack.hydration(track);
        } else {
          // Temporary logic to import track to a new channel
          const nextTrackChannel = localStorage.getItem('nextTrackChannel');
          let nextTrackChannelIndex;

          if (nextTrackChannel !== null) {
            nextTrackChannelIndex = parseInt(nextTrackChannel, 10);
            localStorage.setItem(
              playlist.id.toString(),
              JSON.stringify({
                [track.uuid]: nextTrackChannelIndex,
              }),
            );
            localStorage.removeItem('nextTrackChannel');
          }

          const playlistInfo = localStorage.getItem(playlist.id.toString());
          if (playlistInfo !== null) {
            const parsedInfo = JSON.parse(playlistInfo) as Record<
              string,
              number
            >;
            if (parsedInfo !== null) {
              nextTrackChannelIndex = parsedInfo[track.uuid];
            }
          }
          // End logic

          this.importTrack(track, nextTrackChannelIndex);
        }
      });

      // Remove tracks that are no longer in the playlist
      this.tracks.forEach((track) => {
        if (
          !playlist.tracks.find((pTrack) => pTrack.uuid === track.meta.uuid)
        ) {
          this.removeTrack(track);
        }
      });
    });

    // Load tracks audio
    await this.loadTracks();

    if (IS_DEBUG_LEVEL_INFO) {
      // eslint-disable-next-line no-console
      console.info('Player: hydrated');
    }
  };
}
