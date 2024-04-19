import { Tick } from '../model';

import { getTickSegmentWidthZoomed } from './getTickSegmentWidthZoomed';

const createTick = (
  index: number,
  segmentWidth: number,
  isFirstTick: boolean,
  step: number,
) => ({
  x: index * segmentWidth + index * Number(!isFirstTick),
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

export const getSubTicks = (
  subTickCount: number,
  subTickSegmentWidth: number,
) => {
  return Array.from(Array(subTickCount)).map((_, i) =>
    createTick(i + 1, subTickSegmentWidth, false, 1),
  );
};

export const getTicks = (
  width: number,
  zoom: number,
  shift: number,
  stepRule: (zoom: number) => number,
  subTickCountRule: (step: number) => number,
  tickSegmentWidthRule: (zoom: number) => { min: number; max: number },
  subTickSegmentWidthRule: (zoom: number) => { min: number; max: number },
  zoomStepBreakpointRule: (zoom: number) => number,
): { mainTicks: Tick[]; subTicks: Tick[] } => {
  const step = stepRule(zoom);
  const zoomStepBreakpoint = zoomStepBreakpointRule(zoom);

  const tickSegmentWidth = tickSegmentWidthRule(zoom);
  const subTickSegmentWidth = subTickSegmentWidthRule(zoom);

  const subTickCount = subTickCountRule(step);

  const mainTicks = getMainTicks(
    width,
    shift,
    step,
    getTickSegmentWidthZoomed(tickSegmentWidth.min, zoom, zoomStepBreakpoint),
  );

  const subTicks = getSubTicks(
    subTickCount,
    getTickSegmentWidthZoomed(
      subTickSegmentWidth.min,
      zoom,
      zoomStepBreakpoint,
    ),
  );

  return { mainTicks, subTicks };
};
