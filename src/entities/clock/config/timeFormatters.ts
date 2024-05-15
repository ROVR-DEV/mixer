export const minutesFormatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 3,
  useGrouping: false,
});

export const secondsAndMillisecondsFormatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 2,
  useGrouping: false,
});
