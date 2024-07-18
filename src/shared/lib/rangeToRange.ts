export const rangeToRange = (
  value: number,
  oldRange: { min: number; max: number },
  newRange: { min: number; max: number },
): number => {
  return (
    ((value - oldRange.min) * (newRange.max - newRange.min)) /
      (oldRange.max - oldRange.min) +
    newRange.min
  );
};
