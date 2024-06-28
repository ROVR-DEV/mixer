export const roundTo = (value: number, precision: number) => {
  const offset = Math.pow(10, precision);
  return Math.round(value * offset) / offset;
};
