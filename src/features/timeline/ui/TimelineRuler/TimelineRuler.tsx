'use client';

import { CSSProperties, memo, useEffect, useRef } from 'react';

import {
  drawVerticalLine,
  getTicks,
  getSegmentWidth,
  getStepInSeconds,
  getSubTickSegmentWidth,
  getSubTickHeight,
  getTickSegmentWidthZoomed,
  getZoomStepBreakpoint,
} from '../../lib';

import { TimelineRulerProps } from './interfaces';

const drawMainDash = (
  ctx: CanvasRenderingContext2D,
  x: number,
  text: string,
  color: CSSProperties['color'] = 'white',
  height: number = 19,
) => {
  drawVerticalLine(ctx, x, height, color);

  ctx.fillStyle = color;
  ctx.fillText(text, x - 3, ctx.canvas.height - height - 3);
};

const tickValueToTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = (value - minutes * 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return { minutes, seconds };
};

export const TimelineRuler = ({
  ticksStartPadding = 0,
  shiftPercent,
  zoom,
  width,
  color = 'white',
  ...props
}: TimelineRulerProps) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const height = 30;

  useEffect(() => {
    const element = canvas.current;

    if (!element) {
      return;
    }

    const ctx = element.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const shiftX = (shiftPercent / 100) * width * zoom;

    const step = getStepInSeconds(zoom);
    const zoomStepBreakpoint = getZoomStepBreakpoint(zoom);

    const segmentWidth = getSegmentWidth(zoom);
    const subTickSegmentWidth = getSubTickSegmentWidth(zoom);

    const subTickCountRuleBySeconds = (step: number) => {
      if (step == 30) {
        return 2;
      } else if (step == 10) {
        return 9;
      } else if (step === 5) {
        return 4;
      } else if (step === 1) {
        return 9;
      } else if (step === 0.5) {
        return 4;
      } else if (step === 0.1) {
        return 9;
      } else if (step === 0.05) {
        return 4;
      }

      return 4;
    };

    const ticks = getTicks(
      width * zoom,
      step,
      getTickSegmentWidthZoomed(segmentWidth.min, zoom, zoomStepBreakpoint),
      getTickSegmentWidthZoomed(
        subTickSegmentWidth.min,
        zoom,
        zoomStepBreakpoint,
      ),
      subTickCountRuleBySeconds(step),
    );

    const subTickHeight = getSubTickHeight(ticks.subTicks.length);

    const subTickHeightRule = (index: number) => {
      if (ticks.subTicks.length === 9) {
        return index !== 4;
      } else if (ticks.subTicks.length === 15) {
        return index % 4 !== 0;
      } else if (ticks.subTicks.length === 31) {
        return index % 8 !== 0;
      }

      return false;
    };

    ticks.mainTicks.forEach((tick) => {
      if (tick.x >= shiftX) {
        const { minutes, seconds } = tickValueToTime(tick.number);

        drawMainDash(
          ctx,
          tick.x + ticksStartPadding - shiftX,
          `${minutes}:${seconds}`,
          color,
        );

        ticks.subTicks.forEach((subTick, i) =>
          drawVerticalLine(
            ctx,
            tick.x + subTick.x + ticksStartPadding - shiftX,
            subTickHeightRule(i) ? subTickHeight.short : subTickHeight.tall,
            color,
          ),
        );
      }
    });
  }, [zoom, shiftPercent, width, ticksStartPadding, color]);

  return (
    <div className='relative w-full'>
      <canvas width={width} height={height} ref={canvas} {...props} />
      <div className='absolute bottom-[13px] w-full border-t border-t-ruler' />
      <div className='absolute bottom-0 w-full border-b border-b-ruler' />
    </div>
  );
};

export const TimelineRulerMemoized = memo(TimelineRuler);
