export const formatChannelNumber = (number: number) =>
  number.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
