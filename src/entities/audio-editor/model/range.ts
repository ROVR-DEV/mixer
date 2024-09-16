import { clamp } from '@/shared/lib';

export type ValueInRangeListener = (value: number) => void;

export type RangeStepRule = (
  value: number,
  step: number,
  increase: boolean,
) => number;

export class Range {
  private _step: number;
  private _min: number;
  private _max: number;
  readonly rule: RangeStepRule;

  private _value: number;

  private _listeners: Set<ValueInRangeListener> = new Set();

  private _disableListeners: boolean = false;

  constructor(step: number, min: number, max: number, rule: RangeStepRule) {
    this._step = step;
    this._min = min;
    this._max = max;

    this._value = this._clamp(0);

    this.rule = rule;
  }

  get value() {
    return this._value;
  }

  set value(value: number) {
    this._value = this._clamp(value);
    this._triggerAllListeners();
  }

  get disableListeners(): boolean {
    return this._disableListeners;
  }
  set disableListeners(value: boolean) {
    this._disableListeners = value;
  }

  get min() {
    return this._min;
  }

  set min(min: number) {
    if (this._min === min) {
      return;
    }

    this._min = clamp(0, min);

    if (this._value < this._min) {
      this.value = this._min;
    }

    this._triggerAllListeners();
  }

  get max() {
    return this._max;
  }

  set max(max: number) {
    if (this._max === max) {
      return;
    }

    this._max = clamp(max, this._min);

    if (this._value > this._max) {
      this.value = this._max;
    }

    this._triggerAllListeners();
  }

  get step() {
    return this._step;
  }

  set step(step: number) {
    this._step = step;
  }

  addListener = (listener: ValueInRangeListener) => {
    this._listeners.add(listener);
  };

  removeListener = (listener: ValueInRangeListener) => {
    this._listeners.delete(listener);
  };

  // TODO: bool as argument is bad practice, negative step is better solution
  private handleStep(shouldIncrease = false): number {
    this._value = this._clamp(
      this.rule(this._value, this._step, shouldIncrease),
    );
    this._triggerAllListeners();

    return this._value;
  }

  public increase = (): number => this.handleStep(true);

  public decrease = (): number => this.handleStep(false);

  private _triggerAllListeners = () => {
    if (this.disableListeners) {
      return;
    }

    this._listeners.forEach((listener) => listener(this._value));
  };

  private _clamp = (value: number) => {
    if (value <= this._min) {
      return this._min;
    } else if (value >= this._max) {
      return this._max;
    } else {
      return value;
    }
  };
}
