'use client';

import { Property } from 'csstype';
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useWindowEventListener } from 'rooks';

import { drawGrid, getDpi, setupCanvasAndCtx } from '../../lib';
import { Tick } from '../../model';

import { TimelineGridProps, TimelineGridRef } from './interfaces';

// TODO: refactor rendering mechanism
// move out render functions in separate files and
// expose only render with canvas context access to imperative handle
export const TimelineGrid = ({
  height,
  controlRef,
  style,
  ...props
}: TimelineGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current === null) {
      return;
    }
    canvasCtxRef.current = setupCanvasAndCtx(canvasRef.current, getDpi());
  }, []);

  const handleCanvasRef = useCallback(
    (ref: HTMLCanvasElement | null) => {
      canvasRef.current = ref;
      updateCanvasSize();
    },
    [updateCanvasSize],
  );

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

  const finalControlRef = useRef<TimelineGridRef | null>(null);

  useImperativeHandle(
    typeof controlRef === 'function' ? finalControlRef : controlRef,
    () => ({
      render,
    }),
    [render],
  );

  useEffect(() => {
    if (typeof controlRef === 'function') {
      controlRef(finalControlRef.current);
    }
  }, [controlRef]);

  useEffect(() => {
    updateCanvasSize();
  }, [height, updateCanvasSize]);

  useWindowEventListener('resize', updateCanvasSize);

  return (
    <canvas
      ref={handleCanvasRef}
      style={{ height: height, ...style }}
      {...props}
    />
  );
};

export const TimelineGridMemoized = memo(TimelineGrid);
