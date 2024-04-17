'use client';

import { CSSProperties, useEffect, useRef } from 'react';

import {
  drawVerticalLine,
  getTicks,
  getSegmentWidth,
  getStep,
  getSubTickSegmentWidth,
  getSubTickHeight,
} from '../../lib';

import { TimelineRulerProps } from './interfaces';

const drawMainDash = (
  ctx: CanvasRenderingContext2D,
  offset: number,
  text: string,
  color: CSSProperties['color'] = 'white',
) => {
  const x = offset + 1;

  const lineHeight = 19;

  drawVerticalLine(ctx, x, lineHeight, color);

  ctx.fillStyle = color;
  ctx.fillText(text, x - 3, ctx.canvas.height - lineHeight - 3);
};

const tickValueToTime = (value: number) => {
  const minutes = (value / 60).toFixed();
  const seconds = value.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return { minutes, seconds };
};

const TimelineRuler = ({
  ticksStartPadding = 0,
  shiftPercent,
  zoom,
  width,
  color = 'white',
  ...props
}: TimelineRulerProps) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);

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

    console.log(shiftPercent);

    const step = getStep(zoom);
    const segmentWidth = getSegmentWidth(zoom);
    const subTickSegmentWidth = getSubTickSegmentWidth();
    const ticks = getTicks(
      width * zoom,
      zoom,
      step,
      segmentWidth.min,
      segmentWidth.max,
      subTickSegmentWidth.min,
      subTickSegmentWidth.max,
    );

    const subTickHeight = getSubTickHeight(ticks.subTicks.length);

    const subTickHeightRule = (index: number) => {
      if (ticks.subTicks.length === 7) {
        return index % 2 === 0;
      } else if (ticks.subTicks.length === 15) {
        return index % 4 !== 0;
      } else if (ticks.subTicks.length === 31) {
        return index % 8 !== 0;
      }

      return false;
    };

    ticks.mainTicks.forEach((tick) => {
      if (tick.x >= shiftX) {
        const { minutes, seconds } = tickValueToTime(tick.number * 1000);

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
      <canvas width={width} height={30} ref={canvas} {...props} />
      <div className='absolute bottom-[13px] w-full border-t border-t-ruler' />
      <div className='absolute bottom-0 w-full border-b border-b-ruler' />
    </div>
  );
};

export default TimelineRuler;
