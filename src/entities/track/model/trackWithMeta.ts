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

  currentStartTime: number;
  currentEndTime: number;

  startTimeOffset: number;
  endTimeOffset: number;

  constructor(track: Track, channel: Channel, audioBuffer?: T) {
    this.channel = channel;

    this.originalTrack = track;
    this.audioBuffer = audioBuffer ?? null;

    this.duration = track.end - track.start;

    this.currentStartTime = track.start;
    this.currentEndTime = track.end;

    this.startTimeOffset = 0;
    this.endTimeOffset = 0;

    this.uuid = v4();

    makeAutoObservable(this);
  }

  setAudioBuffer = (audioBuffer: T) => {
    if (this.audioBuffer === audioBuffer) {
      return;
    }

    this.audioBuffer = audioBuffer;

    if (audioBuffer instanceof WaveSurfer) {
      audioBuffer.once('ready', () => {
        runInAction(() => {
          this.audioBufferPeaks = audioBuffer.exportPeaks();
        });
      });
    }
  };

  initAudioElement = (src: HTMLMediaElement['src']) => {
    this.mediaElement = new Audio(src);
    this.trackAudioFilters = new TrackAudioFilters(this.mediaElement);

    // this.trackAudioFilters.fadeInEndTime = this.startTimeOffset;
    // this.trackAudioFilters.fadeOutStartTime =
    //   this.duration - this.endTimeOffset;
  };

  setChannel = (channel: Channel) => {
    if (this.channel !== channel) {
      this.channel = channel;
    }
  };

  setNewStartTime = (time: number) => {
    const segmentDuration = this.currentEndTime - this.currentStartTime;

    this.currentStartTime = time;
    this.currentEndTime = this.currentStartTime + segmentDuration;

    if (this.trackAudioFilters) {
      this.trackAudioFilters.fadeInNode.linearFadeOut(this.startTimeOffset, 0);
      this.trackAudioFilters.fadeOutNode.linearFadeOut(
        this.duration - this.endTimeOffset,
        0,
      );
    }
  };

  setStartTime = (time: number) => {
    const offset = time - this.currentStartTime;

    this.currentStartTime = time;
    this.startTimeOffset = offset;

    if (this.trackAudioFilters) {
      this.trackAudioFilters.fadeInNode.linearFadeOut(this.startTimeOffset, 0);
    }
  };

  setEndTime = (time: number) => {
    const offset = this.currentEndTime - time;

    this.currentEndTime = time;
    this.endTimeOffset = offset;

    if (this.trackAudioFilters) {
      this.trackAudioFilters.fadeOutNode.linearFadeOut(
        this.startTimeOffset,
        this.duration - this.endTimeOffset,
      );
    }
  };
}
