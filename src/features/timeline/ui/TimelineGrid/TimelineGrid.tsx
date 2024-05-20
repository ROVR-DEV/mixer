'use client';

import { Property } from 'csstype';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { drawGrid, getDpi, setupCanvasAndCtx } from '../../lib';
import { Tick } from '../../model';

import { TimelineGridProps, TimelineGridRef } from './interfaces';

export const TimelineGrid = forwardRef<TimelineGridRef, TimelineGridProps>(
  function TimelineGrid({ height, style, ...props }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    const handleCanvasRef = (newRef: HTMLCanvasElement | null) => {
      if (!newRef) {
        return;
      }

      canvasRef.current = newRef;

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const dpi = getDpi();

      const ctx = setupCanvasAndCtx(canvas, dpi);
      if (!ctx) {
        return;
      }

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

    useEffect(() => {
      const recalculateDpi = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const dpi = getDpi();

        const ctx = setupCanvasAndCtx(canvas, dpi);
        if (!ctx) {
          return;
        }

        canvasCtxRef.current = ctx;
      };

      window.addEventListener('resize', recalculateDpi);
      return () => window.removeEventListener('resize', recalculateDpi);
    }, []);

    return (
      <canvas
        ref={handleCanvasRef}
        style={{ height: height, ...style }}
        {...props}
      />
    );
  },
);

export const TimelineGridMemoized = memo(TimelineGrid);
