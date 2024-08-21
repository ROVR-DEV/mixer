import {
  ValueInRangeChangeRule,
  ValueInRangeController,
} from './valueInRangeController';

export const scrollRule = (
  value: number,
  step: number,
  increase: boolean,
): number => {
  return value + (increase ? 1 : -1) * step;
};

export class ScrollController extends ValueInRangeController {
  constructor(
    step: number,
    min: number,
    max: number,
    rule: ValueInRangeChangeRule = scrollRule,
  ) {
    super(step, min, max, rule);
  }
}
