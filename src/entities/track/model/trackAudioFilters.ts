import { makeAutoObservable, runInAction } from 'mobx';
import WaveSurfer from 'wavesurfer.js';

import { FadeFilter } from './fadeFilter';

export class TrackAudioFilters {
  readonly audioBuffer: WaveSurfer;

  readonly fadeInNode: FadeFilter = new FadeFilter();
  readonly fadeOutNode: FadeFilter = new FadeFilter();

  constructor(audioBuffer: WaveSurfer) {
    this.audioBuffer = audioBuffer;

    this.audioBuffer.on('ready', this._initFilters);
    this.audioBuffer.on('timeupdate', this._process);

    makeAutoObservable(this);
  }

  private _initFilters = () => {
    runInAction(() => {
      const duration = this.audioBuffer.getDuration();

      this.fadeInNode.minTime = this.fadeOutNode.minTime = 0;
      this.fadeInNode.maxTime = this.fadeOutNode.maxTime = duration;
    });
  };

  private _processFade = (time: number, fadeFilter: FadeFilter) => {
    const timeDiff = fadeFilter.endTime - fadeFilter.startTime;
    const volumeDiff = fadeFilter.endTimeValue - fadeFilter.startTimeValue;
    const newVolume =
      fadeFilter.startTimeValue +
      ((time - fadeFilter.startTime) * volumeDiff) / timeDiff;
    const clampedVolume = Math.min(1, Math.max(0, newVolume));
    const roundedVolume = Math.round(clampedVolume * 100) / 100;

    if (roundedVolume !== this.audioBuffer.getVolume()) {
      this.audioBuffer.setVolume(roundedVolume);
    }
  };

  private _process = (time: number) => {
    runInAction(() => {
      if (
        time > this.fadeInNode.endTime &&
        time < this.fadeOutNode.startTime &&
        this.audioBuffer.getVolume() !== 1
      ) {
        this.audioBuffer.setVolume(1);
      }
      if (time < this.fadeInNode.endTime) {
        this._processFade(time, this.fadeInNode);
      } else if (time > this.fadeOutNode.startTime) {
        this._processFade(time, this.fadeOutNode);
      }
    });
  };
}
