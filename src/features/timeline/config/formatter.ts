export const tickValueSecondsFormatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

export const tickValueSecondsFormatterDecimal = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 2,
  minimumFractionDigits: 1,
  useGrouping: false,
});

export const tickValueSecondsFormatterHundredth = new Intl.NumberFormat(
  'en-US',
  {
    minimumIntegerDigits: 2,
    minimumFractionDigits: 2,
    useGrouping: false,
  },
);
