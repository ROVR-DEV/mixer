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
  }

  get maxTime(): number {
    return this._maxTime;
  }
  set maxTime(value: number) {
    this.maxTime = value;
  }

  get startTime(): number {
    return this._startTime;
  }
  set startTime(startTime: number) {
    this._startTime = startTime;
  }

  get endTime(): number {
    return this._endTime;
  }
  set endTime(endTime: number) {
    this._endTime = endTime;
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

  linearFadeIn = (start: number, duration: number) => {
    this._linearFade(start, duration, 0, 1);
  };

  linearFadeOut = (start: number, duration: number) => {
    this._linearFade(start, duration, 1, 0);
  };

  private _linearFade = (
    start: number,
    duration: number,
    startTimeValue: number,
    endTimeValue: number,
  ) => {
    this.startTime = clamp(start, this.minTime, this.maxTime);
    this.endTime = clamp(start + duration, this.minTime, this.maxTime);

    this._startTimeValue = startTimeValue;
    this._endTimeValue = endTimeValue;
  };
}
