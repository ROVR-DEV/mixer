'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { drawRulerInSeconds } from '../../lib';

import { TimelineRulerProps } from './interfaces';

export const TimelineRuler = ({
  timelineWidth,
  width,
  height = 30,
  zoom,
  ticksStartPadding = 0,
  shift,
  color = 'white',
  // style,
  ...props
}: TimelineRulerProps) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const [dpi, setDpi] = useState(1);

  useEffect(() => {
    setDpi(
      typeof window !== 'undefined' && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1,
    );
  }, []);

  useEffect(() => {
    const element = canvas.current;

    if (!element) {
      return;
    }

    const ctx = element.getContext('2d');

    if (!ctx) {
      return;
    }

    setCtx(ctx);
  }, []);

  useEffect(() => {
    if (!ctx) {
      return;
    }

    const ctxTransforms = ctx.getTransform();
    if (ctxTransforms.a !== dpi) {
      ctx.scale(dpi, dpi);
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawRulerInSeconds(
      ctx,
      timelineWidth * dpi,
      zoom,
      shift,
      ticksStartPadding,
      color,
    );
  }, [zoom, width, shift, ticksStartPadding, color, ctx, dpi, timelineWidth]);

  return (
    <div className='relative w-full'>
      <canvas
        width={width * dpi}
        height={height * dpi}
        ref={canvas}
        style={{
          width,
          height,
          aspectRatio: `auto ${width}/${height}`,
        }}
        {...props}
      />
      <div className='absolute bottom-[13px] w-full border-t border-t-ruler' />
      <div className='absolute bottom-0 w-full border-b border-b-ruler' />
    </div>
  );
};

export const TimelineRulerMemoized = memo(TimelineRuler);
