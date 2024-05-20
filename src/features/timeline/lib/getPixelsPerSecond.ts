import {
  STEP_IN_SECONDS_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
} from '../config';

import { getByRanges } from './getByRanges';
import { getTickSegmentWidthZoomed } from './getTickSegmentWidthZoomed';

export const getPixelPerSeconds = (zoom: number) => {
  const range = getByRanges(zoom, STEP_IN_SECONDS_RANGES);
  const zoomStepBreakpoint = getByRanges(zoom, ZOOM_BREAKPOINT_RANGES);
  const tickSegmentWidth = getTickSegmentWidthZoomed(
    getByRanges(zoom, TICK_SEGMENT_WIDTH_RANGES).min,
    zoom,
    zoomStepBreakpoint,
  );
  return tickSegmentWidth / range;
};
