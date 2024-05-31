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

import { cn } from '@/shared/lib';

import {
  drawRuler,
  getDpi,
  getSubTickHeight,
  setupCanvasAndCtx,
  tickValueToString,
} from '../../lib';
import { Tick } from '../../model';

import { TimelineRulerProps } from './interfaces';

export const TimelineRuler = forwardRef<HTMLDivElement, TimelineRulerProps>(
  function TimelineRuler(
    {
      controlRef,
      canvasProps: { className: canvasClassName, ...canvasProps } = {
        className: '',
      },
      className,
      ...props
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const dpi = getDpi();

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
        zoom: number,
        color?: Property.Color | undefined,
      ) => {
        const ctx = canvasCtxRef.current;

        if (!ctx) {
          return;
        }

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
      },
      [],
    );

    useImperativeHandle(
      controlRef,
      () => ({
        render,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [render, dpi],
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        className={cn('relative bg-transparent', className)}
        ref={ref}
        {...props}
      >
        <canvas
          className={cn('pointer-events-none w-full', canvasClassName)}
          ref={handleCanvasRef}
          {...canvasProps}
        />
        <div className='pointer-events-none absolute bottom-[13px] w-full border-t border-t-ruler' />
        <div className='pointer-events-none absolute bottom-0 w-full border-b border-b-ruler' />
      </div>
    );
  },
);

export const TimelineRulerMemoized = memo(TimelineRuler);
