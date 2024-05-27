import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

import { Track } from './track';

export class TrackWithMeta<T = WaveSurfer> {
  channel: Channel;

  uuid: string;

  data: Track;
  audioBuffer: T | null;

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

  setChannel = (channel: Channel) => {
    if (this.channel !== channel) {
      this.channel = channel;
    }
  };

  setNewStartTime = (time: number) => {
    const segmentDuration = this.currentEndTime - this.currentStartTime;

    this.currentStartTime = time;
    this.currentEndTime = this.currentStartTime + segmentDuration;
  };

  setStartTime = (time: number) => {
    const offset = time - this.currentStartTime;

    this.currentStartTime = time;
    this.startTimeOffset = offset;
  };

  setEndTime = (time: number) => {
    const offset = this.currentEndTime - time;

    this.currentEndTime = time;
    this.endTimeOffset = offset;
  };
}
