import { makeAutoObservable, runInAction } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

import { clamp } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

import { getLocalBounds } from '../lib';

import { AudioFilters } from './audioFilters';
import { Track } from './track';

export class AudioEditorTrack {
  readonly uuid: string = v4();

  readonly meta: Track;

  readonly mediaElement: HTMLMediaElement = new Audio();

  audioPeaks: number[][] | null = null;

  startTime: number;
  endTime: number;

  startTrimDuration: number = 0;
  endTrimDuration: number = 0;

  private _channel: Channel;

  private _audioBuffer: WaveSurfer | null = null;

  private _filters: AudioFilters = new AudioFilters();

  private _color: string | null = null;

  private _isTrimming: boolean = false;
  private _isDragging: boolean = false;

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
  set color(value: string) {
    this._color = value;
  }

  get isTrimming() {
    return this._isTrimming;
  }
  set isTrimming(value: boolean) {
    this._isTrimming = value;
  }

  get isDragging() {
    return this._isDragging;
  }
  set isDragging(value: boolean) {
    this._isDragging = value;
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
    this.meta = track;

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

    this._audioBuffer.once('ready', () => {
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
}
