import { makeAutoObservable } from 'mobx';

export interface Region {
  start: number;
  end: number;

  get duration(): number;
}

export class MobxRegion implements Region {
  private _from: number = 0;
  private _to: number = 0;

  get duration(): number {
    return this.end - this.start;
  }

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

  constructor() {
    makeAutoObservable(this);
  }
}
