import { EventEmitter } from 'eventemitter3';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

import { clamp, Timer } from '@/shared/lib';

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
  timeupdate: number;
}

export interface Player {
  readonly channels: Channel[];
  readonly tracks: AudioEditorTrack[];
  readonly tracksByAudioUuid: Map<string, AudioEditorTrack>;
  readonly playlist: Playlist | null;
  readonly trackLoader: TrackLoader;

  readonly region: Region;

  readonly time: number;
  readonly isPlaying: boolean;

  importPlaylist(playlists: Playlist): void;
  updatePlaylist(playlists: Playlist): void;

  importTrack(track: Track, channelIndex?: number): void;
  removeTrack(track: AudioEditorTrack): void;

  loadTracks(withPeaks?: boolean): Promise<void>;

  play(): void;
  stop(): void;

  setTime(value: number): void;

  addChannel(channel?: Channel): void;
  removeChannel(channel: Channel): void;
  isChannelMuted(channel: Channel): boolean;
  isChannelSolo(channel: Channel): boolean;

  clear(): void;

  on(event: keyof PlayerEvents, listener: TimeListener): void;
  off(event: keyof PlayerEvents, listener: TimeListener): void;

  getState(): PlayerState;
  restoreState(state: PlayerState): void;
}

export class ObservablePlayer implements Player {
  private _colorsGenerator = trackColorsGenerator(TRACK_COLORS);

  readonly channels = observable.array<Channel>();
  readonly region: Region = new ObservableRegion();
  readonly trackLoader: TrackLoader = new ObserverTrackLoader();

  private _playlist: Playlist | null = null;

  private _emitter = new EventEmitter<PlayerEvents>();

  private _timer: Timer | null = null;
  private _time = 0;
  private _isPlaying = false;

  get playlist(): Playlist | null {
    return this._playlist;
  }

  get time() {
    return this._time;
  }
  set time(value: number) {
    this.setTime(value);
  }

  get isPlaying() {
    return this._isPlaying;
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

  updatePlaylist = (playlist: Playlist): void => {
    this._playlist = playlist;
  };

  importTrack = (track: Track, channelIndex?: number): void => {
    const index = this.tracks.length;

    if (channelIndex && channelIndex >= this.channels.length) {
      this.addChannel();
    }

    this.channels[channelIndex ?? index % 2]?.importTrack(track);
  };

  removeTrack = (track: AudioEditorTrack): void => {
    track.channel.removeTrack(track);
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

      if (withPeaks) {
        const generateAndSetPeaks = async () => {
          const buffer = await trackData.blob?.arrayBuffer();

          if (!buffer) {
            track.setPeaks([]);
            return;
          }

          const peaks = await calculatePeaks(buffer);

          track.setPeaks(peaks);
        };

        generateAndSetPeaks();
      }

      track.load(trackData.objectUrl);
    };

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
    const newTime = clamp(time, 0);
    this._time = newTime;
    this._timer?.setTime(newTime * 1000);
    this._emitter.emit('timeupdate', newTime);

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
    this.stop();

    this.channels.forEach((channel) => channel.dispose());
    this.channels.clear();

    this.setTime(0);
  };

  on(event: keyof PlayerEvents, listener: TimeListener): void {
    this._emitter.on(event, listener);
  }

  off(event: keyof PlayerEvents, listener: TimeListener): void {
    this._emitter.off(event, listener);
  }

  private _onTimeUpdate = (time: number) => {
    this._time = time;
    this._process(time);
    this._emitter.emit('timeupdate', time);
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
}
