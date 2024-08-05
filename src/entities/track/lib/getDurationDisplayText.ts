import { parseSecondsToParts } from '@/shared/lib';

export const padFormatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

export const getDurationDisplayText = (duration: number) => {
  const { minutes, seconds, milliseconds } = parseSecondsToParts(duration);
  return `${padFormatter.format(minutes)}:${padFormatter.format(seconds)}:${padFormatter.format(Math.round(milliseconds / 10))}`;
};
