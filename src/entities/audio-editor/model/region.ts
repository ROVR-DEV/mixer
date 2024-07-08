import { makeAutoObservable } from 'mobx';

export interface Region {
  start: number;
  end: number;

  get duration(): number;

  isEnabled: boolean;

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
    this._from = value;
  }

  get end(): number {
    return this._to;
  }
  set end(value: number) {
    this._to = value;
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

  toggle = () => {
    if (this.duration === 0) {
      if (this._isEnabled) {
        this._isEnabled = false;
      }

      return;
    }

    this._isEnabled = !this._isEnabled;
  };

  constructor() {
    makeAutoObservable(this);
  }
}
