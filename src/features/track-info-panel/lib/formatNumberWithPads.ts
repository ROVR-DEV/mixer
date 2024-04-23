export const formatNumberWithPads = (value: number, digits: number = 3) =>
  value.toLocaleString('en-US', {
    minimumIntegerDigits: digits,
    useGrouping: false,
  });
