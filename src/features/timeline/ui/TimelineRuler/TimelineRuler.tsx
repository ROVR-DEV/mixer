'use client';

import { useEffect, useRef } from 'react';

import {
  drawVerticalLine,
  getTicks,
  getSegmentWidth,
  getStep,
  getSubTickSegmentWidth,
  getSubTickHeight,
} from '../../lib';

import { TimelineRulerProps } from './interfaces';

const TimelineRuler = ({
  shiftPercent,
  zoom,
  width,
  ...props
}: TimelineRulerProps) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const drawMainDash = (
    ctx: CanvasRenderingContext2D,
    offset: number,
    text: string,
  ) => {
    const x = offset + 1;

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.moveTo(x, ctx.canvas.height);
    ctx.lineTo(x, ctx.canvas.height / 2);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.fillText(text, x + 4, ctx.canvas.height / 2 + 3);
  };

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

    // const shiftX = (shiftPercent / 100) * width * zoom;

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
      drawMainDash(ctx, tick.x, tick.number.toString());
      ticks.subTicks.forEach((subTick, i) =>
        drawVerticalLine(
          ctx,
          tick.x + subTick.x,
          subTickHeightRule(i) ? subTickHeight.short : subTickHeight.tall,
        ),
      );
    });
  }, [zoom, shiftPercent, width]);

  return (
    <canvas
      className='border-b border-b-white'
      width={width}
      height={18}
      ref={canvas}
      {...props}
    />
  );
};

export default TimelineRuler;
