import { ResultRange } from '../model';

export const ZOOM_STEP = 1.25;

export const DEFAULT_RANGES: Omit<ResultRange, 'result'>[] = [
  { start: 0.1, end: 1 },
  { start: 1, end: Math.pow(ZOOM_STEP, 3) },
  { start: Math.pow(ZOOM_STEP, 3), end: Math.pow(ZOOM_STEP, 6) },
  { start: Math.pow(ZOOM_STEP, 6), end: Math.pow(ZOOM_STEP, 13) },
  { start: Math.pow(ZOOM_STEP, 13), end: Math.pow(ZOOM_STEP, 16) },
  { start: Math.pow(ZOOM_STEP, 16), end: Math.pow(ZOOM_STEP, 23) },
  { start: Math.pow(ZOOM_STEP, 23), end: Math.pow(ZOOM_STEP, 26) },
  { start: Math.pow(ZOOM_STEP, 26), end: Number.MAX_VALUE },
];

const STEP_IN_SECONDS = [60, 30, 10, 5, 1, 0.5, 0.1, 0.05];

const TICK_SEGMENT_WIDTH = [
  { min: 24, max: Infinity },
  { min: 123, max: 201 },
  { min: 80, max: 125 },
  { min: 78, max: 313 },
  { min: 85, max: 122 },
  { min: 82, max: 330 },
  { min: 82, max: 134 },
  { min: 75, max: Number.MAX_VALUE },
];

const SUB_TICK_SEGMENT_WIDTH = [
  { min: 5, max: 68 },
  { min: 42, max: 68 },
  { min: 7, max: 14 },
  { min: 14, max: 62 },
  { min: 7, max: 11 },
  { min: 16, max: 65 },
  { min: 7, max: 12 },
  { min: 14, max: Number.MAX_VALUE },
];

export const STEP_IN_SECONDS_RANGES: ResultRange<number>[] = DEFAULT_RANGES.map(
  (range, i) => ({ ...range, result: STEP_IN_SECONDS[i] }),
);

export const TICK_SEGMENT_WIDTH_RANGES: ResultRange<{
  min: number;
  max: number;
}>[] = DEFAULT_RANGES.map((range, i) => ({
  ...range,
  result: TICK_SEGMENT_WIDTH[i],
}));

export const SUB_TICK_SEGMENT_WIDTH_RANGES: ResultRange<{
  min: number;
  max: number;
}>[] = DEFAULT_RANGES.map((range, i) => ({
  ...range,
  result: SUB_TICK_SEGMENT_WIDTH[i],
}));

export const ZOOM_BREAKPOINT_RANGES: ResultRange<number>[] = DEFAULT_RANGES.map(
  (range) => ({
    ...range,
    result: range.start,
  }),
);
