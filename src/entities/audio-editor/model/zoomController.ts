import { RangeRule, Range } from './valueInRangeController';

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
    rule: RangeRule = zoomRule,
  ) {
    super(step, min, max, rule);
  }
}
