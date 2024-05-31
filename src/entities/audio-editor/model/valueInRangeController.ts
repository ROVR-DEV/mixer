export type ValueInRangeListener = (value: number) => void;

export type ValueInRangeChangeRule = (
  value: number,
  step: number,
  increase: boolean,
) => number;

export class ValueInRangeController {
  private _step: number;
  private _min: number;
  private _max: number;
  readonly rule: ValueInRangeChangeRule;

  private _value: number;

  private _listeners: Set<ValueInRangeListener> = new Set();

  constructor(
    step: number,
    min: number,
    max: number,
    rule: ValueInRangeChangeRule,
  ) {
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

  get min() {
    return this._min;
  }

  set min(min: number) {
    this._min = min;

    if (this._value < this._min) {
      this.value = this._value;
    }
  }

  get max() {
    return this._max;
  }

  set max(max: number) {
    this._max = max;

    if (this._value > this._max) {
      this.value = this._value;
    }
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

  increase = (): number => {
    this._value = this._clamp(this.rule(this._value, this._step, true));
    this._triggerAllListeners();
    return this._value;
  };

  decrease = (): number => {
    this._value = this._clamp(this.rule(this._value, this._step, false));
    this._triggerAllListeners();
    return this._value;
  };

  private _triggerAllListeners = () => {
    this._listeners.forEach((listener) => listener(this._value));
  };

  private _clamp = (value: number) => {
    if (value < this._min) {
      return this._min;
    } else if (value > this._max) {
      return this._max;
    } else {
      return value;
    }
  };
}
