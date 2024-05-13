import { CSSProperties } from 'react';

import {
  DEFAULT_RANGES,
  STEP_IN_SECONDS_RANGES,
  SUB_TICK_SEGMENT_WIDTH_RANGES,
  TICK_SEGMENT_WIDTH_RANGES,
  ZOOM_BREAKPOINT_RANGES,
  tickValueSecondsFormatter,
  tickValueSecondsFormatterDecimal,
  tickValueSecondsFormatterHundredth,
} from '../config';

import { drawRuler } from './drawRuler';
import { getByRanges } from './getByRanges';
import { getSubTickCountBySeconds } from './getSubTickCountBySeconds';
import { getSubTickHeight } from './getSubTickHeight';
import { getTicks } from './getTicks';

const getFractionRuleByZoom = (zoom: number) => {
  if (zoom < DEFAULT_RANGES[4].start) {
    return tickValueSecondsFormatter;
  } else if (zoom >= DEFAULT_RANGES[4].start && zoom < DEFAULT_RANGES[4].end) {
    return tickValueSecondsFormatterDecimal;
  } else {
    return tickValueSecondsFormatterHundredth;
  }
};

const tickValueToTime = (value: number, zoom: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = getFractionRuleByZoom(zoom).format(value - minutes * 60);

  return { minutes, seconds };
};

export const tickValueToString = (value: number, zoom: number) => {
  const { minutes, seconds } = tickValueToTime(value, zoom);
  return `${minutes}:${seconds}`;
};

export const drawRulerInSeconds = (
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
  const subTickHeight = getSubTickHeight(ticks.subTicks.length);

  drawRuler(
    ctx,
    ticks,
    subTickHeight,
    ticksStartPadding,
    shift,
    (value) => tickValueToString(value, zoom),
    color,
  );
};
