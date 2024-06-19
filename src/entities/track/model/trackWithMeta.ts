import { makeAutoObservable, runInAction } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

import { clamp } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

import { getLocalBounds } from '../lib';

import { Track } from './track';
import { TrackAudioFilters } from './trackAudioFilters';

export class TrackWithMeta<T = WaveSurfer> {
  channel: Channel;

  uuid: string;

  originalTrack: Track;
  audioBuffer: T | null;
  audioBufferPeaks: number[][] | null = null;
  mediaElement: HTMLMediaElement | null = null;

  trackAudioFilters: TrackAudioFilters | null = null;

  duration: number;

  startTime: number;
  endTime: number;

  visibleStartTime: number;
  visibleEndTime: number;

  private _isTrimming: boolean = false;

  get isTrimming() {
    return this._isTrimming;
  }
  set isTrimming(value: boolean) {
    this._isTrimming = value;
  }

  get visibleDuration(): number {
    return this.visibleEndTime - this.visibleStartTime;
  }

  get startTimeOffset(): number {
    return this.visibleStartTime - this.startTime;
  }
  get endTimeOffset(): number {
    return this.endTime - this.visibleEndTime;
  }

  private _color: string | null = null;

  get color(): string | null {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }

  constructor(track: Track, channel: Channel, audioBuffer?: T) {
    this.channel = channel;

    this.originalTrack = track;
    this.audioBuffer = audioBuffer ?? null;

    this.duration = track.end - track.start;

    this.startTime = track.start;
    this.endTime = track.end;

    this.visibleStartTime = track.start;
    this.visibleEndTime = track.end;

    this.uuid = v4();

    makeAutoObservable(this, {
      color: true,
      startTimeOffset: true,
      endTimeOffset: true,
      isTrimming: true,
    });
  }

  setAudioBuffer = (audioBuffer: T) => {
    if (this.audioBuffer === audioBuffer) {
      return;
    }

    this.audioBuffer = audioBuffer;

    if (audioBuffer instanceof WaveSurfer) {
      this.trackAudioFilters = new TrackAudioFilters(audioBuffer);

      this.trackAudioFilters.fadeInNode.linearFadeIn(this.startTimeOffset, 0);
      this.trackAudioFilters.fadeOutNode.linearFadeOut(
        this.duration - this.endTimeOffset,
        0,
      );

      audioBuffer.once('ready', () => {
        runInAction(() => {
          this.audioBufferPeaks = audioBuffer.exportPeaks();
        });
      });
    }
  };

  initAudioElement = (src: HTMLMediaElement['src']) => {
    this.mediaElement = new Audio(src);
  };

  setChannel = (channel: Channel) => {
    if (this.channel !== channel) {
      this.channel = channel;
    }
  };

  setNewStartTime = (time: number) => {
    this._updateTimeBounds(time);
    this._updateVisibleTimeBounds(time);
  };

  setStartTime = (time: number) => {
    this.visibleStartTime = time;

    this._updateAudioFilters();
  };

  setEndTime = (time: number) => {
    this.visibleEndTime = time;

    this._updateAudioFilters();
  };

  private _updateTimeBounds = (time: number) => {
    this.startTime = time - this.startTimeOffset;
    this.endTime = this.startTime + this.duration;
  };

  private _updateVisibleTimeBounds = (time: number) => {
    const segmentDuration = this.visibleEndTime - this.visibleStartTime;
    this.visibleStartTime = time;
    this.visibleEndTime = this.visibleStartTime + segmentDuration;
  };

  private _updateAudioFilters = () => {
    if (!this.trackAudioFilters) {
      return;
    }

    const fadeInBounds = getLocalBounds(this, 'left');

    const newFadeInStartTime = clamp(
      this.startTimeOffset,
      fadeInBounds.leftBound,
      fadeInBounds.rightBound,
    );

    const newFadeInDuration =
      clamp(
        newFadeInStartTime + this.trackAudioFilters.fadeInNode.duration,
        fadeInBounds.leftBound,
        fadeInBounds.rightBound,
      ) - newFadeInStartTime;

    this.trackAudioFilters.fadeInNode.linearFadeIn(
      newFadeInStartTime,
      newFadeInDuration,
    );

    const fadeOutBounds = getLocalBounds(this, 'right');

    const newFadeOutStartTime = clamp(
      this.duration -
        this.endTimeOffset -
        this.trackAudioFilters.fadeOutNode.duration,
      fadeOutBounds.leftBound,
      fadeOutBounds.rightBound,
    );

    const newFadeOutDuration =
      clamp(
        newFadeOutStartTime + this.trackAudioFilters.fadeOutNode.duration,
        fadeOutBounds.leftBound,
        fadeOutBounds.rightBound,
      ) - newFadeOutStartTime;

    this.trackAudioFilters.fadeOutNode.linearFadeOut(
      newFadeOutStartTime,
      newFadeOutDuration,
    );
  };
}
