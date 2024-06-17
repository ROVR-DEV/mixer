import { makeAutoObservable, runInAction } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

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

  startTimeOffset: number;
  endTimeOffset: number;

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

    this.startTimeOffset = 0;
    this.endTimeOffset = 0;

    this.uuid = v4();

    makeAutoObservable(this, {
      color: true,
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
    const segmentDuration = this.visibleEndTime - this.visibleStartTime;

    this.startTime = time - this.startTimeOffset;
    this.endTime = this.startTime + this.duration;

    this.visibleStartTime = time;
    this.visibleEndTime = this.visibleStartTime + segmentDuration;
  };

  setStartTime = (time: number) => {
    const offset = time - this.startTime;

    this.visibleStartTime = time;
    this.startTimeOffset = offset;
  };

  setEndTime = (time: number) => {
    const offset = this.endTime - time;

    this.visibleEndTime = time;
    this.endTimeOffset = offset;
  };
}
