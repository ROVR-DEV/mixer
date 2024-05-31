export const clamp = (
  value: number,
  min: number = -Infinity,
  max: number = Infinity,
): number => {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
};
