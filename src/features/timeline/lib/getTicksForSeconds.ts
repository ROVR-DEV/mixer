import {
  STEP_IN_SECONDS_RANGES,
  SUB_TICK_SEGMENT_WIDTH_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
} from '../config';

import { getByRanges } from './getByRanges';
import { getSubTickCountBySeconds } from './getSubTickCountBySeconds';
import { getTicks } from './getTicks';

export const getTicksForSeconds = (
  width: number,
  zoom: number,
  shift: number,
) => {
  return getTicks(
    width,
    zoom,
    shift,
    (zoom) => getByRanges(zoom, STEP_IN_SECONDS_RANGES),
    getSubTickCountBySeconds,
    (zoom) => getByRanges(zoom, TICK_SEGMENT_WIDTH_RANGES),
    (zoom) => getByRanges(zoom, SUB_TICK_SEGMENT_WIDTH_RANGES),
    (zoom) => getByRanges(zoom, ZOOM_BREAKPOINT_RANGES),
  );
};
