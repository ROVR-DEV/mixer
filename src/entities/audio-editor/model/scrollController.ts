import { RangeRule, Range } from './valueInRangeController';

export const scrollRule = (
  value: number,
  step: number,
  increase: boolean,
): number => {
  return value + (increase ? 1 : -1) * step;
};

export class ScrollController extends Range {
  constructor(
    step: number,
    min: number,
    max: number,
    rule: RangeRule = scrollRule,
  ) {
    super(step, min, max, rule);
  }
}
