import { makeAutoObservable, runInAction } from 'mobx';
import WaveSurfer from 'wavesurfer.js';

import { FadeFilter } from './fadeFilter';

export class AudioFilters {
  readonly fadeInNode: FadeFilter = new FadeFilter();
  readonly fadeOutNode: FadeFilter = new FadeFilter();

  private _audioBuffer: WaveSurfer | null = null;
  private _unsubscribeFunctions: (() => void)[] = [];

  get audioBuffer(): WaveSurfer | null {
    return this._audioBuffer;
  }
  set audioBuffer(value: WaveSurfer) {
    if (this.audioBuffer === value) {
      return;
    }

    this._unsubscribeFunctions.forEach((fn) => fn());

    this._audioBuffer = value;

    this._unsubscribeFunctions.push(
      this._audioBuffer.on('ready', this._initFilters),
    );
    this._unsubscribeFunctions.push(
      this._audioBuffer.on('timeupdate', this._process),
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  private _initFilters = () => {
    runInAction(() => {
      if (!this._audioBuffer) {
        return;
      }

      const duration = this._audioBuffer.getDuration();

      this.fadeInNode.minTime = this.fadeOutNode.minTime = 0;
      this.fadeInNode.maxTime = this.fadeOutNode.maxTime = duration;
    });
  };

  private _processFade = (time: number, fadeFilter: FadeFilter) => {
    if (!this._audioBuffer) {
      return;
    }

    const timeDiff = fadeFilter.endTime - fadeFilter.startTime;
    const volumeDiff = fadeFilter.endTimeValue - fadeFilter.startTimeValue;
    const newVolume =
      fadeFilter.startTimeValue +
      ((time - fadeFilter.startTime) * volumeDiff) / timeDiff;
    const clampedVolume = Math.min(1, Math.max(0, newVolume));
    const roundedVolume = Math.round(clampedVolume * 100) / 100;

    if (roundedVolume !== this._audioBuffer.getVolume()) {
      this._audioBuffer.setVolume(roundedVolume);
    }
  };

  private _process = (time: number) => {
    runInAction(() => {
      if (!this._audioBuffer) {
        return;
      }

      if (
        time > this.fadeInNode.endTime &&
        time < this.fadeOutNode.startTime &&
        this._audioBuffer.getVolume() !== 1
      ) {
        this._audioBuffer.setVolume(1);
      }
      if (time < this.fadeInNode.endTime) {
        this._processFade(time, this.fadeInNode);
      } else if (time > this.fadeOutNode.startTime) {
        this._processFade(time, this.fadeOutNode);
      }
    });
  };
}