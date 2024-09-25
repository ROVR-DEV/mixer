'use client';

import { Property } from 'csstype';
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';

import { cn } from '@/shared/lib';
import { HiDpiCanvasMemoized } from '@/shared/ui';

import { drawRuler, getSubTickHeight, tickValueToString } from '../../lib';
import { Tick } from '../../model';

import { TimelineRulerProps } from './interfaces';

export const TimelineRuler = forwardRef<HTMLDivElement, TimelineRulerProps>(
  function TimelineRuler(
    {
      controlRef,
      canvasProps: { className: canvasClassName, ...canvasProps } = {
        className: '',
      },
      centerLine = true,
      className,
      ...props
    },
    ref,
  ) {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    const render = useCallback(
      (
        ticks: { mainTicks: Tick[]; subTicks: Tick[] },
        shift: number,
        ticksStartPadding: number,
        zoom: number,
        color?: Property.Color | undefined,
      ) => {
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
      [ctx],
    );

    useImperativeHandle(
      controlRef,
      () => ({
        render,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [render],
    );

    return (
      <div
        className={cn('relative bg-transparent', className)}
        ref={ref}
        {...props}
      >
        <HiDpiCanvasMemoized
          className={cn('pointer-events-none w-full', canvasClassName)}
          onHiDpiCtxCreate={setCtx}
          {...canvasProps}
        />
        {!centerLine ? null : (
          <>
            <div className='pointer-events-none absolute bottom-[13px] w-full border-t border-t-ruler' />
          </>
        )}
        <div className='pointer-events-none absolute bottom-0 w-full border-b border-b-ruler' />
      </div>
    );
  },
);

export const TimelineRulerMemoized = memo(TimelineRuler);
