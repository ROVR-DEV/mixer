import { CSSProperties } from 'react';

import {
  STEP_IN_SECONDS_RANGES,
  SUB_TICK_SEGMENT_WIDTH_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
} from '../config';

import { drawGrid } from './drawGrid';
import { getByRanges } from './getByRanges';
import { getSubTickCountBySeconds } from './getSubTickCountBySeconds';
import { getTicks } from './getTicks';

export const drawGridInSeconds = (
  ctx: CanvasRenderingContext2D,
  width: number,
  zoom: number,
  shift: number,
  ticksStartPadding: number,
  color: CSSProperties['color'] = 'white',
) => {
  const ticks = getTicks(
    width,
    zoom,
    shift,
    (zoom) => getByRanges(zoom, STEP_IN_SECONDS_RANGES),
    getSubTickCountBySeconds,
    (zoom) => getByRanges(zoom, TICK_SEGMENT_WIDTH_RANGES),
    (zoom) => getByRanges(zoom, SUB_TICK_SEGMENT_WIDTH_RANGES),
    (zoom) => getByRanges(zoom, ZOOM_BREAKPOINT_RANGES),
  );

  drawGrid(ctx, ticks, ticksStartPadding, shift, color);
};
