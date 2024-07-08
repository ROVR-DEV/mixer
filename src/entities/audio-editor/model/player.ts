import { EventEmitter } from 'eventemitter3';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

import { clamp, Timer } from '@/shared/lib';
import { HistoryManager } from '@/shared/model';

// eslint-disable-next-line boundaries/element-types
import { Channel, TRACK_COLORS } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrack } from '@/entities/track';

import { ObservableRegion, Region } from './region';
import { trackColorsGenerator } from './trackColorsGenerator';

export type TimeListener = (time: number) => void;

interface AudioEditorTrackState {
  uuid: string;
  channelId: string;

  startTime: number;
  endTime: number;

  startTrimDuration: number;
  endTrimDuration: number;
}

export interface ChannelState {
  tracks: AudioEditorTrackState[];
}

export interface PlayerState {
  channels: ChannelState[];
}

export interface PlayerEvents {
  timeupdate: number;
}

export interface Player {
  readonly channels: Channel[];
  readonly tracks: AudioEditorTrack[];

  readonly region: Region;

  readonly time: number;
  readonly isPlaying: boolean;

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

  undo: () => void;
  redo: () => void;

  clearState(): void;
  saveState(): void;
}

export class ObservablePlayer implements Player {
  private _colorsGenerator = trackColorsGenerator(TRACK_COLORS);

  readonly channels = observable.array<Channel>();
  readonly region: Region = new ObservableRegion();

  private _history = new HistoryManager<PlayerState>();

  private _emitter = new EventEmitter<PlayerEvents>();

  private _timer: Timer | null = null;
  private _time = 0;
  private _isPlaying = false;

  get time() {
    return this._time;
  }
  set time(value: number) {
    this.setTime(value);
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get tracks(): AudioEditorTrack[] {
    return this.channels.flatMap((channel) => channel.tracks);
  }

  private get _soloChannels(): Channel[] {
    return this.channels.filter((channel) => channel.isSolo);
  }

  constructor() {
    this._timer = new Timer((time: number) => this._onTimeUpdate(time / 1000));

    makeAutoObservable<ObservablePlayer, '_soloChannels'>(this, {
      _soloChannels: computed,
      time: computed,
      isPlaying: computed,
    });
  }

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
    return channel.isMuted || this._soloChannels.includes(channel);
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

  clearState(): void {
    this._history.clear();
  }

  saveState(): void {
    this._history.addState({
      channels: this.channels.map<ChannelState>((channel) => ({
        tracks: channel.tracks.map<AudioEditorTrackState>((track) => ({
          uuid: track.uuid,
          channelId: track.channel.id,
          startTime: track.startTime,
          endTime: track.endTime,
          startTrimDuration: track.startTrimDuration,
          endTrimDuration: track.endTrimDuration,
        })),
      })),
    });
  }

  undo = () => {
    const state = this._history.undo();

    if (!state) {
      return;
    }

    state.channels.forEach((channel) =>
      channel.tracks.forEach((track) => {
        runInAction(() => {
          const foundTrack = this.tracks.find((tr) => tr.uuid === track.uuid);

          if (!foundTrack) {
            return;
          }

          // @ts-expect-error private
          foundTrack.uuid = track.uuid;
          foundTrack.channel = this.channels.find(
            (ch) => ch.id === track.channelId,
          )!;
          foundTrack.startTime = track.startTime;
          foundTrack.endTime = track.endTime;
          foundTrack.startTrimDuration = track.startTrimDuration;
          foundTrack.endTrimDuration = track.endTrimDuration;
        });
      }),
    );

    const tracks = [...this.tracks];

    this.channels.forEach((channel) => channel.clearTracks());

    tracks.forEach((track) => {
      track.channel.addTrack(track);
    });
  };

  redo = () => {
    const state = this._history.redo();

    if (!state) {
      return;
    }

    state.channels.forEach((channel) =>
      channel.tracks.forEach((track) => {
        runInAction(() => {
          const foundTrack = this.tracks.find((tr) => tr.uuid === track.uuid);

          if (!foundTrack) {
            return;
          }

          // @ts-expect-error private
          foundTrack.uuid = track.uuid;
          foundTrack.channel = this.channels.find(
            (ch) => ch.id === track.channelId,
          )!;
          foundTrack.startTime = track.startTime;
          foundTrack.endTime = track.endTime;
          foundTrack.startTrimDuration = track.startTrimDuration;
          foundTrack.endTrimDuration = track.endTrimDuration;
        });
      }),
    );

    const tracks = [...this.tracks];

    this.channels.forEach((channel) => channel.clearTracks());

    tracks.forEach((track) => {
      track.channel.addTrack(track);
    });
  };
}
