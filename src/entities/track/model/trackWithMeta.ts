import { makeAutoObservable } from 'mobx';
import WaveSurfer from 'wavesurfer.js';

import { Track } from './track';

export class TrackWithMeta<T = WaveSurfer> {
  data: Track;
  channelId: string;
  audioBuffer: T | null;

  currentStartTime: number;
  currentEndTime: number;

  constructor(track: Track, channelId: string, audioBuffer?: T) {
    this.data = track;
    this.channelId = channelId;
    this.audioBuffer = audioBuffer ?? null;

    this.currentStartTime = track.start;
    this.currentEndTime = track.end;

    makeAutoObservable(this);
  }

  setNewStartTime = (time: number) => {
    const trackDuration = this.currentEndTime - this.currentStartTime;

    this.currentStartTime = time;
    this.currentEndTime = this.currentStartTime + trackDuration;
  };

  setStartTime = (time: number) => {
    this.currentStartTime = time;
  };

  setEndTime = (time: number) => {
    this.currentEndTime = time;
  };
}
