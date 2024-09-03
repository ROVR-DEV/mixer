import { memoize } from 'lodash-es';

import { Tick } from '../model';

import { getTickSegmentWidthZoomed } from './getTickSegmentWidthZoomed';

const createTick = (index: number, segmentWidth: number, step: number) => ({
  x: index * segmentWidth,
  number: index * step,
});

export const getMainTicks = (
  visibleWidth: number,
  shift: number,
  step: number,
  segmentWidth: number,
) => {
  const bufferTicksCount = 2;

  const count = Math.ceil(visibleWidth / segmentWidth) + bufferTicksCount;
  const startIndex = Math.floor(shift / segmentWidth) - bufferTicksCount / 2;

  return Array.from(Array(count)).map((_, i) =>
    createTick(startIndex + i, segmentWidth, step),
  );
};

const getMainTicksMemoized = memoize(
  getMainTicks,
  (visibleWidth: number, shift: number, step: number, segmentWidth: number) =>
    `${visibleWidth}-${shift}-${step}-${segmentWidth}`,
);

export const getSubTicks = (
  subTickCount: number,
  subTickSegmentWidth: number,
) => {
  return Array.from(Array(subTickCount)).map((_, i) =>
    createTick(i + 1, subTickSegmentWidth, 1),
  );
};

const getSubTicksMemoized = memoize(
  getSubTicks,
  (subTickCount, subTickSegmentWidthZoomed) =>
    `${subTickCount}-${subTickSegmentWidthZoomed}`,
);

export const getTicks = (
  visibleWidth: number,
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

  const tickSegmentWidthZoomed = getTickSegmentWidthZoomed(
    tickSegmentWidth.min,
    zoom,
    zoomStepBreakpoint,
  );

  const subTickCount = subTickCountRule(step);

  const mainTicks = getMainTicksMemoized(
    visibleWidth,
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
