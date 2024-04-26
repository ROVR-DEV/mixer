import { memoize } from 'lodash-es';

import { Tick } from '../model';

import { getTickSegmentWidthZoomed } from './getTickSegmentWidthZoomed';

const createTick = (
  index: number,
  segmentWidth: number,
  isFirstTick: boolean,
  step: number,
) => ({
  x: index * segmentWidth,
  number: index * step,
});

export const getMainTicks = (
  width: number,
  shift: number,
  step: number,
  segmentWidth: number,
) => {
  const count = Math.ceil(width / segmentWidth) + 100;
  const startIndex = Math.floor(shift / segmentWidth) - 100;

  return Array.from(Array(count)).map((_, i) =>
    createTick(startIndex + i, segmentWidth, startIndex + i === 0, step),
  );
};

const getMainTicksMemoized = memoize(
  getMainTicks,
  (width: number, shift: number, step: number, segmentWidth: number) =>
    `${width}-${shift}-${step}-${segmentWidth}`,
);

export const getSubTicks = (
  subTickCount: number,
  subTickSegmentWidth: number,
) => {
  return Array.from(Array(subTickCount)).map((_, i) =>
    createTick(i + 1, subTickSegmentWidth, false, 1),
  );
};

const getSubTicksMemoized = memoize(
  getSubTicks,
  (subTickCount, subTickSegmentWidthZoomed) =>
    `${subTickCount}-${subTickSegmentWidthZoomed}`,
);

export const getTicks = (
  width: number,
  zoom: number,
  shift: number,
  stepRule: (zoom: number) => number,
  subTickCountRule: (step: number) => number,
  tickSegmentWidthRule: (zoom: number) => { min: number; max: number },
  // TODO unused
  subTickSegmentWidthRule: (zoom: number) => { min: number; max: number },
  zoomStepBreakpointRule: (zoom: number) => number,
): { mainTicks: Tick[]; subTicks: Tick[] } => {
  const step = stepRule(zoom);
  const zoomStepBreakpoint = zoomStepBreakpointRule(zoom);

  const tickSegmentWidth = tickSegmentWidthRule(zoom);
  // const subTickSegmentWidth = subTickSegmentWidthRule(zoom);

  const tickSegmentWidthZoomed = getTickSegmentWidthZoomed(
    tickSegmentWidth.min,
    zoom,
    zoomStepBreakpoint,
  );
  // const subTickSegmentWidthZoomed = getTickSegmentWidthZoomed(
  //   subTickSegmentWidth.min,
  //   zoom,
  //   zoomStepBreakpoint,
  // );

  const subTickCount = subTickCountRule(step);

  const mainTicks = getMainTicksMemoized(
    width,
    shift,
    step,
    tickSegmentWidthZoomed,
  );

  const subTicks = getSubTicksMemoized(
    subTickCount,
    tickSegmentWidthZoomed / (subTickCount + 1),
  );

  return { mainTicks, subTicks };
};
