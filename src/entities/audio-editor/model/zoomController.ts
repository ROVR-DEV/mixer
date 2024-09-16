import { RangeStepRule, Range } from './range';

export const zoomRule = (
  value: number,
  step: number,
  increase: boolean,
): number => {
  return increase ? value * step : value / step;
};

export class ZoomController extends Range {
  constructor(
    step: number,
    min: number,
    max: number,
    rule: RangeStepRule = zoomRule,
  ) {
    super(step, min, max, rule);
  }
}
