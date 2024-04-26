'use client';

import { Property } from 'csstype';
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import { drawGrid } from '../../lib';
import { Tick } from '../../model';
import { TimelineCanvasMemoized } from '../TimelineCanvas';

import { TimelineGridProps, TimelineGridRef } from './interfaces';

export const TimelineGrid = forwardRef<TimelineGridRef, TimelineGridProps>(
  function TimelineGrid({ width, height = 1, ...props }, ref) {
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
        tickColor?: Property.Color | undefined,
        subTickColor?: Property.Color | undefined,
      ) => {
        const ctx = canvasCtxRef.current;

        if (!ctx) {
          return;
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        drawGrid(ctx, ticks, ticksStartPadding, shift, tickColor, subTickColor);
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
      <TimelineCanvasMemoized
        width={width}
        height={height}
        dpi={dpi}
        ref={handleCanvasRef}
        {...props}
      />
    );
  },
);

export const TimelineGridMemoized = memo(TimelineGrid);
