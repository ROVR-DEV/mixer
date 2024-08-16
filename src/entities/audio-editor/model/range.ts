import { interpolateInTime } from '@/shared/lib';

export type RangeListener = (value: number) => void;

export type RangeRule = (
  value: number,
  step: number,
  increase: boolean,
) => number;

export class Range {
  private _step: number;
  private _min: number;
  private _max: number;
  readonly rule: RangeRule;

  private _value: number;
  private _targetValue: number;

  private _listeners: Set<RangeListener> = new Set();

  private _disableListeners: boolean = false;

  private _increaseTimerId: number | null = null;
  private _decreaseTimerId: number | null = null;

  constructor(step: number, min: number, max: number, rule: RangeRule) {
    this._step = step;
    this._min = min;
    this._max = max;

    this._value = this._clamp(0);
    this._targetValue = this._value;

    this.rule = rule;
  }

  get value() {
    return this._value;
  }

  set value(value: number) {
    this._value = this._clamp(value);
    this._targetValue = this._value;
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
    this._min = min;

    if (this._value < this._min) {
      this.value = this._min;
    }
  }

  get max() {
    return this._max;
  }

  set max(max: number) {
    this._max = max;

    if (this._value > this._max) {
      this.value = this._max;
    }
  }

  get step() {
    return this._step;
  }

  set step(step: number) {
    this._step = step;
  }

  addListener = (listener: RangeListener) => {
    this._listeners.add(listener);
  };

  removeListener = (listener: RangeListener) => {
    this._listeners.delete(listener);
  };

  increase = (
    options: { behavior?: 'instant' | 'smooth' } | undefined = {
      behavior: 'instant',
    },
  ): number => {
    if (this._value === this.max) {
      return this._value;
    }

    if (options.behavior === 'instant') {
      return this._increase();
    } else {
      return this._increaseSmooth();
    }
  };

  decrease = (
    options: { behavior?: 'instant' | 'smooth' } | undefined = {
      behavior: 'instant',
    },
  ): number => {
    if (this._value === this._min) {
      return this._value;
    }

    if (options.behavior === 'instant') {
      return this._decrease();
    } else {
      return this._decreaseSmooth();
    }
  };

  private _increase = (): number => {
    this._value = this._clamp(this.rule(this._value, this._step, true));
    this._targetValue = this.value;
    this._triggerAllListeners();
    return this._value;
  };

  // TODO: need to override in child classes to different smooth behavior
  private _increaseSmooth = (): number => {
    this._targetValue = this._clamp(
      this.rule(this._targetValue, this._step, true),
    );

    if (this._increaseTimerId !== null) {
      cancelAnimationFrame(this._increaseTimerId);
      this._increaseTimerId = null;
    }

    interpolateInTime(
      this._value,
      this._targetValue,
      (value, timerId) => {
        this._value = value;
        this._triggerAllListeners();

        this._increaseTimerId = timerId;
      },
      165, // Default chrome one scroll duration
      15, // Default chrome on scroll steps
    );

    return this._targetValue;
  };

  private _decrease = (): number => {
    this._value = this._clamp(this.rule(this._value, this._step, false));
    this._targetValue = this.value;
    this._triggerAllListeners();
    return this._value;
  };

  private _decreaseSmooth = (): number => {
    this._targetValue = this._clamp(
      this.rule(this._targetValue, this._step, false),
    );

    if (this._decreaseTimerId !== null) {
      cancelAnimationFrame(this._decreaseTimerId);
      this._decreaseTimerId = null;
    }

    interpolateInTime(
      this._value,
      this._targetValue,
      (value, timerId) => {
        this._value = value;
        this._triggerAllListeners();
        this._decreaseTimerId = timerId;
      },
      165,
      15,
    );

    return this._targetValue;
  };

  private _triggerAllListeners = () => {
    if (this.disableListeners) {
      return;
    }

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
