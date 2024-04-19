import { ResultRange } from '../model';

export const getByRanges = <T>(zoom: number, ranges: ResultRange<T>[]) => {
  return (
    ranges.find((range) => zoom >= range.start && zoom < range.end)?.result ??
    ranges.at(-1)!.result
  );
};
