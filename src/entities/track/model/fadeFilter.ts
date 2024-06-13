'use client';

import { makeAutoObservable } from 'mobx';

export class FadeFilter {
  private _startTime: number = 0;
  private _endTime: number = 0;

  private _startTimeValue: number = 0;
  private _endTimeValue: number = 0;

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

  get startTimeValue(): number {
    return this._startTimeValue;
  }

  get endTimeValue(): number {
    return this._endTimeValue;
  }

  constructor() {
    makeAutoObservable(this);
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
    this.startTime = start;
    this.endTime = start + duration;
    this._startTimeValue = startTimeValue;
    this._endTimeValue = endTimeValue;
  };
}
