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

  data: Track;
  audioBuffer: T | null;
  audioBufferPeaks: number[][] | null = null;
  media: HTMLMediaElement | null = null;

  trackAudioFilters: TrackAudioFilters | null = null;

  duration: number;

  currentStartTime: number;
  currentEndTime: number;

  startTimeOffset: number;
  endTimeOffset: number;

  constructor(track: Track, channel: Channel, audioBuffer?: T) {
    this.channel = channel;

    this.data = track;
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
          this.media = audioBuffer.getMediaElement();
          this.audioBufferPeaks = audioBuffer.exportPeaks();

          if (this.media === null || this.trackAudioFilters !== null) {
            return;
          }

          this.trackAudioFilters = new TrackAudioFilters(this.media);

          this.trackAudioFilters.fadeInEndTime = this.startTimeOffset;
          this.trackAudioFilters.fadeOutStartTime =
            this.duration - this.endTimeOffset;
        });
      });
    }
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
      this.trackAudioFilters.fadeInEndTime = this.startTimeOffset;
      this.trackAudioFilters.fadeOutStartTime =
        this.duration - this.endTimeOffset;
    }
  };

  setStartTime = (time: number) => {
    const offset = time - this.currentStartTime;

    this.currentStartTime = time;
    this.startTimeOffset = offset;

    if (this.trackAudioFilters) {
      this.trackAudioFilters.fadeInEndTime = this.startTimeOffset;
    }
  };

  setEndTime = (time: number) => {
    const offset = this.currentEndTime - time;

    this.currentEndTime = time;
    this.endTimeOffset = offset;

    if (this.trackAudioFilters) {
      this.trackAudioFilters.fadeOutStartTime =
        this.duration - this.endTimeOffset;
    }
  };
}
