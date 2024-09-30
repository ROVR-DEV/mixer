import { makeAutoObservable, runInAction } from 'mobx';

import { AudioBufferPlayer } from '@/shared/model';

import { FadeFilter } from './fadeFilter';

export class AudioFilters {
  readonly fadeInNode: FadeFilter = new FadeFilter();
  readonly fadeOutNode: FadeFilter = new FadeFilter();

  private _audio: AudioBufferPlayer | null = null;
  private _unsubscribeFunctions: (() => void)[] = [];

  get audio(): AudioBufferPlayer | null {
    return this._audio;
  }
  set audio(value: AudioBufferPlayer) {
    if (this._audio === value) {
      return;
    }

    this._unsubscribeFunctions.forEach((fn) => fn());

    this._audio = value;

    this._audio.canplay(this._initFilters);

    this._audio.timeupdate(this._processFiltersWrapper);

    this._unsubscribeFunctions.push(() => this._audio?.removeCanplay());
    this._unsubscribeFunctions.push(() => this._audio?.removeTimeupdate());
  }

  get fadeInDuration(): number {
    return this.fadeInNode.duration;
  }

  get fadeOutDuration(): number {
    return this.fadeOutNode.duration;
  }

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * @deprecated
   */
  setFadeInEndTime = (time: number) => {
    this.fadeInNode.linearFadeIn(this.fadeInNode.minTime, time);

    if (this.fadeInNode.endTime > this.fadeOutNode.startTime) {
      this.setFadeOutStartTime(this.fadeInNode.endTime);
    }
  };

  /**
   * @deprecated
   */
  setFadeOutStartTime = (time: number) => {
    this.fadeOutNode.linearFadeOut(time, this.fadeOutNode.maxTime);

    if (this.fadeOutNode.startTime < this.fadeInNode.endTime) {
      this.setFadeInEndTime(this.fadeOutNode.startTime);
    }
  };

  private _initFilters = () => {
    runInAction(() => {
      if (!this._audio) {
        return;
      }

      const duration = this._audio.getDuration();

      this.fadeInNode.minTime = this.fadeOutNode.minTime = 0;
      this.fadeInNode.maxTime = this.fadeOutNode.maxTime = duration;
    });

    this._audio?.removeCanplay();
  };

  private _processFade = (time: number, fadeFilter: FadeFilter) => {
    if (!this._audio) {
      return;
    }

    const timeDiff = fadeFilter.endTime - fadeFilter.startTime;
    const volumeDiff = fadeFilter.endTimeValue - fadeFilter.startTimeValue;

    const newVolume =
      fadeFilter.startTimeValue +
      ((time - fadeFilter.startTime) * volumeDiff) / timeDiff;

    const clampedVolume = Math.min(1, Math.max(0, newVolume));

    const roundedVolume = Math.round(clampedVolume * 100) / 100;

    if (roundedVolume !== this._audio.getVolume()) {
      this._audio.setVolume(roundedVolume);
    }
  };

  private _processFiltersWrapper = () => {
    if (!this._audio) {
      return;
    }

    this._processFilters(this._audio.getCurrentTime());
  };

  private _processFilters = (time: number) => {
    runInAction(() => {
      if (!this._audio) {
        return;
      }

      if (
        time > this.fadeInNode.endTime &&
        time < this.fadeOutNode.startTime &&
        this._audio.getVolume() !== 1
      ) {
        this._audio.setVolume(1);
      } else if (time < this.fadeInNode.endTime) {
        this._processFade(time, this.fadeInNode);
      } else if (time > this.fadeOutNode.startTime) {
        this._processFade(time, this.fadeOutNode);
      }
    });
  };
}
