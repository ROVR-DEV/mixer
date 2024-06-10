'use client';

import { makeAutoObservable } from 'mobx';

export enum Type {
  In,
  Out,
}

export type FadeFilterProps = {
  gainNode: GainNode;
  type: Type;
};

export class FadeFilter {
  readonly gainNode: GainNode;
  private _type: Type = Type.In;

  private _startTimeValue: number = 0;
  private _endTimeValue: number = 1;

  private _prevStartTime: number = 0;
  private _startTime: number = 0;

  private _endTime: number = 0;
  private _prevEndTime: number = 0;

  get startTime(): number {
    return this._startTime;
  }

  get endTime(): number {
    return this._endTime;
  }

  constructor({ gainNode, type = Type.In }: FadeFilterProps) {
    this.gainNode = gainNode;
    this._type = type;

    this._startTimeValue = type === Type.In ? 0 : 1;
    this._startTimeValue = type === Type.In ? 1 : 0;

    makeAutoObservable(this);
  }

  public linearFadeOut(start: number, duration: number) {
    this._prevStartTime = this._startTime;
    this._startTime = start;

    this._prevEndTime = this._endTime;
    this._endTime = start + duration;

    this.gainNode.gain.cancelScheduledValues(this._prevStartTime);
    this.gainNode.gain.cancelScheduledValues(this._prevEndTime);

    this.gainNode.gain.linearRampToValueAtTime(
      this._startTimeValue,
      this._startTime,
    );
    this.gainNode.gain.linearRampToValueAtTime(
      this._endTimeValue,
      this._endTime,
    );
  }
}
