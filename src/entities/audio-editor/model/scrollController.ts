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

const SCROLL_DELTA_X_STEP_COEFFICIENT = 1;

export class ScrollController extends ValueInRangeController {
  constructor(
    step: number,
    min: number,
    max: number,
    rule: ValueInRangeChangeRule = scrollRule,
  ) {
    super(step, min, max, rule);
  }

  /**
   * @description Allows to shift visible area to left or right depending on track pad delta
   * @param deltaX Track pad delta value
   * @returns {number} Coefficient value
   */
  public shiftX(deltaX: number): number {
    const coefficient = deltaX / SCROLL_DELTA_X_STEP_COEFFICIENT;

    this.value += coefficient;

    return coefficient;
  }
}
