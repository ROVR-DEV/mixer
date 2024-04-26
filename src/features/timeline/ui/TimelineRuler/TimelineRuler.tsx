'use client';

import { Property } from 'csstype';
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import { drawRuler, getSubTickHeight } from '../../lib';
import { Tick } from '../../model';
import { TimelineCanvasMemoized } from '../TimelineCanvas';

import { TimelineRulerProps, TimelineRulerRef } from './interfaces';

export const TimelineRuler = forwardRef<TimelineRulerRef, TimelineRulerProps>(
  function TimelineRuler({ width, height = 30, ...props }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const dpi =
      typeof window !== 'undefined' && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1;

    const handleCanvasRef = (newRef: HTMLCanvasElement | null) => {
      if (!newRef) {
        return;
      }

      canvasRef.current = newRef;

      const element = canvasRef.current;

      if (!element) {
        return;
      }

      const ctx = element.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.scale(dpi, dpi);

      canvasCtxRef.current = ctx;
    };

    const render = useCallback(
      (
        ticks: { mainTicks: Tick[]; subTicks: Tick[] },
        shift: number,
        ticksStartPadding: number,
        color?: Property.Color | undefined,
      ) => {
        const ctx = canvasCtxRef.current;

        if (!ctx) {
          return;
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const subTickHeight = getSubTickHeight(ticks.subTicks.length);

        drawRuler(ctx, ticks, subTickHeight, ticksStartPadding, shift, color);
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        render,
      }),
      [render],
    );

    return (
      <div className='relative w-full'>
        <TimelineCanvasMemoized
          width={width}
          height={height}
          dpi={dpi}
          ref={handleCanvasRef}
          {...props}
        />
        <div className='absolute bottom-[13px] w-full border-t border-t-ruler' />
        <div className='absolute bottom-0 w-full border-b border-b-ruler' />
      </div>
    );
  },
);

export const TimelineRulerMemoized = memo(TimelineRuler);
