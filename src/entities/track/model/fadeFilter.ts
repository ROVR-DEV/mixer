'use client';

import { computed, makeAutoObservable } from 'mobx';

import { clamp } from '@/shared/lib';

export class FadeFilter {
  private _minTime: number = -Infinity;
  private _maxTime: number = Infinity;

  private _startTime: number = 0;
  private _endTime: number = 0;

  private _startTimeValue: number = 0;
  private _endTimeValue: number = 0;

  get minTime(): number {
    return this._minTime;
  }
  set minTime(value: number) {
    this._minTime = value;
    this._updateStartEndTime();
  }

  get maxTime(): number {
    return this._maxTime;
  }
  set maxTime(value: number) {
    this._maxTime = value;
    this._updateStartEndTime();
  }

  get startTime(): number {
    return this._startTime;
  }
  set startTime(value: number) {
    this._startTime = value;
  }

  get endTime(): number {
    return this._endTime;
  }
  set endTime(value: number) {
    this._endTime = value;
  }

  get duration(): number {
    return this._endTime - this._startTime;
  }

  get startTimeValue(): number {
    return this._startTimeValue;
  }

  get endTimeValue(): number {
    return this._endTimeValue;
  }

  constructor() {
    makeAutoObservable(this, {
      minTime: computed,
      maxTime: computed,
      startTime: computed,
      endTime: computed,
      duration: computed,
      startTimeValue: computed,
    });
  }

  setBounds = (minTime: number, maxTime: number) => {
    this.minTime = minTime;
    this.maxTime = maxTime;
  };

  linearFadeInDuration = (duration: number) => {
    this.linearFadeIn(this.minTime, this.minTime + duration);
  };

  linearFadeOutDuration = (duration: number) => {
    this.linearFadeOut(this.maxTime - duration, this.maxTime);
  };

  linearFadeIn = (startTime: number, endTime: number) => {
    this._linearFade(startTime, endTime, 0, 1);
  };

  linearFadeOut = (startTime: number, endTime: number) => {
    this._linearFade(startTime, endTime, 1, 0);
  };

  private _updateStartEndTime = () => {
    this.startTime = clamp(this.startTime, this._minTime, this._maxTime);
    this.endTime = clamp(this.endTime, this._minTime, this._maxTime);
  };

  private _linearFade = (
    startTime: number,
    endTime: number,
    startTimeValue: number,
    endTimeValue: number,
  ) => {
    this.startTime = clamp(startTime, this.minTime, this.maxTime);
    this.endTime = clamp(endTime, this.minTime, this.maxTime);

    this._startTimeValue = startTimeValue;
    this._endTimeValue = endTimeValue;
  };
}
