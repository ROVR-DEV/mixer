import { merge } from 'lodash-es';
import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { clamp, toOwnedObservable } from '@/shared/lib';
import { AudioPlayer, HTMLMediaElementAudioPlayer } from '@/shared/model';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { AudioFilters } from './audioFilters';
import { TrackDnDInfo } from './dndInfo';
import { Track } from './track';

export interface AudioEditorTrackState {
  uuid: string;
  channelId: string;

  startTime: number;
  endTime: number;

  startTrimDuration: number;
  endTrimDuration: number;

  meta: Track;

  audioPeaks: Array<Float32Array | number[]> | null;
  isPeaksReady: boolean;

  src: HTMLMediaElement['src'];

  color: string | null;

  filters: {
    fadeIn: {
      startTime: number;
      endTime: number;
    };
    fadeOut: {
      startTime: number;
      endTime: number;
    };
  };
}

export class AudioEditorTrack {
  readonly dndInfo: TrackDnDInfo = new TrackDnDInfo();
  readonly mediaElement: HTMLMediaElement = new Audio();

  audioPeaks: Array<Float32Array | number[]> | null = [];

  startTime: number;
  endTime: number;
  startTrimDuration: number = 0;
  endTrimDuration: number = 0;

  private _audio: AudioPlayer = new HTMLMediaElementAudioPlayer(
    this.mediaElement,
  );
  private _id: string = v4();
  private _isPeaksReady: boolean = false;
  private _meta: Track;
  private _channel: Channel;
  private _audioBuffer: WaveSurfer | null = null;
  private _filters: AudioFilters = new AudioFilters();
  private _color: string | null = null;
  private _isTrimming: boolean = false;
  private _isEditingTitle: boolean = false;

  get audio(): AudioPlayer {
    return this._audio;
  }

  get id(): string {
    return this._id;
  }

  get isPeaksReady(): boolean {
    return this._isPeaksReady;
  }

  get meta() {
    return this._meta;
  }
  private set meta(value: Track) {
    this._meta = toOwnedObservable(value);
  }

  get channel(): Channel {
    return this._channel;
  }
  set channel(value: Channel) {
    this._channel = value;
  }

  get audioBuffer(): WaveSurfer | null {
    return this._audioBuffer;
  }

  get filters(): AudioFilters {
    return this._filters;
  }

  get color(): string | null {
    return this._color;
  }
  set color(value: string | null) {
    this._color = value;
  }

  get isTrimming() {
    return this._isTrimming;
  }
  set isTrimming(value: boolean) {
    this._isTrimming = value;
  }

  get isEditingTitle() {
    return this._isEditingTitle;
  }
  set isEditingTitle(value: boolean) {
    this._isEditingTitle = value;
  }

  get trimStartTime(): number {
    return this.startTime + this.startTrimDuration;
  }

  get trimEndTime(): number {
    return this.endTime - this.endTrimDuration;
  }

  get duration(): number {
    return this.meta.end - this.meta.start;
  }

  get trimDuration(): number {
    return this.trimEndTime - this.trimStartTime;
  }

  constructor(track: Track, channel: Channel) {
    this._meta = toOwnedObservable(track);

    this._channel = channel;

    this.startTime = track.start;
    this.endTime = track.end;

    this.filters.audio = this._audio as HTMLMediaElementAudioPlayer;
    this._updateAudioFiltersBounds();
    this._filters.fadeInNode.linearFadeInDuration(0);
    this._filters.fadeOutNode.linearFadeOutDuration(0);

    makeAutoObservable(this);
  }

  hydration = (track: Track) => {
    merge(this.meta, track);
    // this.meta = track;

    this.startTime = track.start;
    this.endTime = track.end;
  };

  setAudioBuffer = (audioBuffer: WaveSurfer) => {
    if (this._audioBuffer === audioBuffer) {
      return;
    }

    this._audioBuffer = audioBuffer;
    // this._filters.audio = audioBuffer;
  };

  setPeaks = (peaks: typeof this.audioPeaks) => {
    this.audioPeaks = peaks;
    this._isPeaksReady = true;
  };

  setStartTime = (time: number) => {
    this.startTime = time - this.startTrimDuration;
    this.endTime = this.startTime + this.duration;
  };

  setStartTrimDuration(duration: number) {
    this.startTrimDuration = duration;
    this._updateAudioFiltersBounds();
  }

  setEndTrimDuration(duration: number) {
    this.endTrimDuration = duration;
    this._updateAudioFiltersBounds();
  }

  setTitleAndArtist = (
    title: string | undefined,
    artist: string | undefined,
  ) => {
    const trimmedTitle = title?.trim();
    if (trimmedTitle) {
      this.meta.title = trimmedTitle;
    }

    const trimmedArtist = artist?.trim();
    if (trimmedArtist) {
      this.meta.artist = trimmedArtist;
    }

    this.meta = { ...this.meta };
  };

  getRelativeTime = (globalTime: number) => {
    return clamp(globalTime - this.startTime, 0, this.duration);
  };

  split = (time: number) => {
    const clonedTrack = this.clone();

    // Set clonedTrack start time on split time
    clonedTrack.startTrimDuration = time - clonedTrack.startTime;
    clonedTrack.setStartTime(time);

    // Reset cloned track fade in filter
    clonedTrack.filters.fadeInNode.linearFadeIn(
      clonedTrack.startTrimDuration,
      clonedTrack.startTrimDuration,
    );

    clonedTrack.filters.fadeOutNode.linearFadeOut(
      this.filters.fadeOutNode.startTime,
      this.filters.fadeOutNode.endTime,
    );

    // Set original track end time on split time
    this.endTrimDuration = this.endTime - time;

    // Reset original track fade out filter
    this.filters.fadeOutNode.linearFadeOut(
      this.duration - this.endTrimDuration,
      this.duration - this.endTrimDuration,
    );

    this.channel.addTrack(clonedTrack);

    adjustTracksOnPaste(this);
    adjustTracksOnPaste(clonedTrack);

    return clonedTrack;
  };

  clone = () => {
    const clonedTrack = new AudioEditorTrack(this.meta, this.channel);

    clonedTrack.color = this.color;

    clonedTrack.audio.load(this.mediaElement.src);
    clonedTrack.audioPeaks = this.audioPeaks;

    clonedTrack.startTrimDuration = this.startTrimDuration;
    clonedTrack.endTrimDuration = this.endTrimDuration;
    clonedTrack.startTime = this.startTime;
    clonedTrack.endTime = this.endTime;

    clonedTrack._isPeaksReady = this._isPeaksReady;

    return clonedTrack;
  };

  dispose = () => {
    this.audioBuffer?.stop();
    this.audioBuffer?.destroy();
  };

  //#region State
  getState = (): AudioEditorTrackState => {
    return {
      uuid: this.id,
      channelId: this.channel.id,
      startTime: this.startTime,
      endTime: this.endTime,
      startTrimDuration: this.startTrimDuration,
      endTrimDuration: this.endTrimDuration,
      src: this.mediaElement.src,
      color: this.color,
      meta: this.meta,
      isPeaksReady: this._isPeaksReady,
      audioPeaks: this.audioPeaks,
      filters: {
        fadeIn: {
          startTime: this.filters.fadeInNode.startTime,
          endTime: this.filters.fadeInNode.endTime,
        },
        fadeOut: {
          startTime: this.filters.fadeOutNode.startTime,
          endTime: this.filters.fadeOutNode.endTime,
        },
      },
    } satisfies AudioEditorTrackState;
  };

  restoreState = (state: AudioEditorTrackState) => {
    this._id = state.uuid;

    this.startTime = state.startTime;
    this.endTime = state.endTime;
    this.startTrimDuration = state.startTrimDuration;
    this.endTrimDuration = state.endTrimDuration;

    this.meta = state.meta;
    if (!this.mediaElement.src) {
      this.audio.load(state.src);
    }
    this.color = state.color;

    if (state.isPeaksReady) {
      this._isPeaksReady = state.isPeaksReady;
      this.audioPeaks = state.audioPeaks;
    }

    this.filters.fadeInNode.linearFadeIn(
      state.filters.fadeIn.startTime,
      state.filters.fadeIn.endTime,
    );
    this.filters.fadeOutNode.linearFadeOut(
      state.filters.fadeOut.startTime,
      state.filters.fadeOut.endTime,
    );
  };
  //#endregion

  private _updateAudioFiltersBounds = () => {
    if (!this.filters) {
      return;
    }

    const fadeInDuration = this.filters.fadeInDuration;
    const fadeOutDuration = this.filters.fadeOutDuration;

    this.filters.fadeInNode.setBounds(
      this.startTrimDuration,
      this.duration - this.endTrimDuration,
    );
    this.filters.fadeOutNode.setBounds(
      this.startTrimDuration,
      this.duration - this.endTrimDuration,
    );

    this.filters.setFadeInEndTime(
      this.filters.fadeInNode.minTime + fadeInDuration,
    );
    this.filters.setFadeOutStartTime(
      this.filters.fadeOutNode.maxTime - fadeOutDuration,
    );
  };
}
