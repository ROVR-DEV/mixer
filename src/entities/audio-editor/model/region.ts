import { makeAutoObservable } from 'mobx';

import { clamp } from '@/shared/lib';

export interface Region {
  start: number;
  end: number;

  isEnabled: boolean;

  get duration(): number;

  setBounds(start: number, end: number): void;
  toggle(): void;
}

export class ObservableRegion implements Region {
  private _from: number = 0;
  private _to: number = 0;

  private _isEnabled: boolean = false;

  get start(): number {
    return this._from;
  }
  set start(value: number) {
    this._from = clamp(value, 0);
    this._disableIfDurationIsZero();
  }

  get end(): number {
    return this._to;
  }
  set end(value: number) {
    this._to = clamp(value, this._from);
    this._disableIfDurationIsZero();
  }

  get duration(): number {
    return this.end - this.start;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }
  set isEnabled(value: boolean) {
    this._isEnabled = value;
  }

  constructor() {
    makeAutoObservable(this);
  }

  setBounds = (start: number, end: number) => {
    this.start = start;
    this.end = end;
  };

  toggle = () => {
    if (this.duration === 0) {
      if (this._isEnabled) {
        this._isEnabled = false;
      }

      return;
    }

    this._isEnabled = !this._isEnabled;
  };

  private _disableIfDurationIsZero = () => {
    if (this.duration === 0 && this.isEnabled) {
      this.toggle();
    }
  };
}
