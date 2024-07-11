import { makeAutoObservable, runInAction } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

import { clamp } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { getLocalBounds } from '../lib';

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

  audioPeaks: number[][] | null;
  src: HTMLMediaElement['src'];

  color: string | null;

  filters: {
    fadeIn: {
      startTime: number;
      duration: number;
    };
    fadeOut: {
      startTime: number;
      duration: number;
    };
  };
}

export class AudioEditorTrack {
  readonly id: string = v4();

  readonly mediaElement: HTMLMediaElement = new Audio();

  readonly dndInfo: TrackDnDInfo = new TrackDnDInfo();

  audioPeaks: number[][] | null = null;

  startTime: number;
  endTime: number;

  startTrimDuration: number = 0;
  endTrimDuration: number = 0;

  private _meta: Track;

  private _channel: Channel;

  private _audioBuffer: WaveSurfer | null = null;

  private _filters: AudioFilters = new AudioFilters();

  private _color: string | null = null;

  private _isTrimming: boolean = false;

  get meta() {
    return this._meta;
  }
  private set meta(value: Track) {
    this._meta = value;
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
    this._meta = track;

    this._channel = channel;

    this.startTime = track.start;
    this.endTime = track.end;

    this._filters.fadeInNode.linearFadeIn(this.startTrimDuration, 0);
    this._filters.fadeOutNode.linearFadeOut(
      this.duration - this.endTrimDuration,
      0,
    );

    makeAutoObservable(this);
  }

  setAudioBuffer = (audioBuffer: WaveSurfer) => {
    if (this._audioBuffer === audioBuffer) {
      return;
    }

    this._audioBuffer = audioBuffer;
    this._filters.audioBuffer = audioBuffer;

    this._audioBuffer.once('decode', () => {
      runInAction(() => {
        if (!this._audioBuffer) {
          return;
        }

        this.audioPeaks = this._audioBuffer.exportPeaks();
      });
    });
  };

  load = (src: HTMLMediaElement['src']) => {
    this.mediaElement.src = src;
  };

  setStartTime = (time: number) => {
    this.startTime = time - this.startTrimDuration;
    this.endTime = this.startTime + this.duration;
  };

  setStartTrimDuration(duration: number) {
    this.startTrimDuration = duration;
    this._updateAudioFilters();
  }

  setEndTrimDuration(duration: number) {
    this.endTrimDuration = duration;
    this._updateAudioFilters();
  }

  cut = (time: number) => {
    const trackCopy = this.clone();

    trackCopy.setStartTrimDuration(time - trackCopy.startTime);
    trackCopy.setEndTrimDuration(this.endTrimDuration);
    trackCopy.setStartTime(time);

    trackCopy.filters.fadeOutNode.linearFadeOut(
      this.filters.fadeOutNode.startTime,
      this.filters.fadeOutNode.duration,
    );

    this.filters.fadeOutNode.linearFadeOut(
      this.duration - this.endTrimDuration,
      0,
    );

    this.setEndTrimDuration(this.endTime - time);

    this.channel.addTrack(trackCopy);

    adjustTracksOnPaste(this);
    adjustTracksOnPaste(trackCopy);

    return trackCopy;
  };

  clone = () => {
    const clonedTrack = new AudioEditorTrack(this.meta, this.channel);
    clonedTrack.color = this.color;
    clonedTrack.load(this.mediaElement.src);
    clonedTrack.setStartTime(this.startTime);
    return clonedTrack;
  };

  dispose = () => {
    this.audioBuffer?.destroy();
  };

  private _updateAudioFilters = () => {
    if (!this.filters) {
      return;
    }

    const fadeInBounds = getLocalBounds(this, 'left');

    const newFadeInStartTime = clamp(
      this.startTrimDuration,
      fadeInBounds.leftBound,
      fadeInBounds.rightBound,
    );

    const newFadeInDuration =
      clamp(
        newFadeInStartTime + this.filters.fadeInNode.duration,
        fadeInBounds.leftBound,
        fadeInBounds.rightBound,
      ) - newFadeInStartTime;

    this.filters.fadeInNode.linearFadeIn(newFadeInStartTime, newFadeInDuration);

    const fadeOutBounds = getLocalBounds(this, 'right');

    const newFadeOutStartTime = clamp(
      this.duration - this.endTrimDuration - this.filters.fadeOutNode.duration,
      fadeOutBounds.leftBound,
      fadeOutBounds.rightBound,
    );

    const newFadeOutDuration =
      clamp(
        newFadeOutStartTime + this.filters.fadeOutNode.duration,
        fadeOutBounds.leftBound,
        fadeOutBounds.rightBound,
      ) - newFadeOutStartTime;

    this.filters.fadeOutNode.linearFadeOut(
      newFadeOutStartTime,
      newFadeOutDuration,
    );
  };

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
      audioPeaks: this.audioPeaks,
      filters: {
        fadeIn: {
          startTime: this.filters.fadeInNode.startTime,
          duration: this.filters.fadeInNode.duration,
        },
        fadeOut: {
          startTime: this.filters.fadeOutNode.startTime,
          duration: this.filters.fadeOutNode.duration,
        },
      },
    } satisfies AudioEditorTrackState;
  };

  restoreState = (state: AudioEditorTrackState) => {
    this.startTime = state.startTime;
    this.endTime = state.endTime;
    this.startTrimDuration = state.startTrimDuration;
    this.endTrimDuration = state.endTrimDuration;

    this.meta = state.meta;
    if (!this.mediaElement.src) {
      this.load(state.src);
    }
    this.color = state.color;

    this.audioPeaks = state.audioPeaks;

    this.filters.fadeInNode.linearFadeIn(
      state.filters.fadeIn.startTime,
      state.filters.fadeIn.duration,
    );
    this.filters.fadeOutNode.linearFadeOut(
      state.filters.fadeOut.startTime,
      state.filters.fadeOut.duration,
    );
  };
}
