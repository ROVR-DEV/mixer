import {
  ValueInRangeChangeRule,
  ValueInRangeController,
} from './valueInRangeController';

export const zoomRule = (
  value: number,
  step: number,
  increase: boolean,
): number => {
  return increase ? value * step : value / step;
};

export class ZoomController extends ValueInRangeController {
  constructor(
    step: number,
    min: number,
    max: number,
    rule: ValueInRangeChangeRule = zoomRule,
  ) {
    super(step, min, max, rule);
  }
}
