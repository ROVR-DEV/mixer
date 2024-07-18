'use client';

import { forwardRef, memo, useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { cn, GhostResizePlugin } from '@/shared/lib';

import { WAVEFORM_COLORS } from '../../config';

import { WaveformProps } from './interfaces';
import styles from './styles.module.css';

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
// function renderFunction(
//   options: Omit<WaveSurferOptions, 'container'> | undefined,
//   channelData: Array<Float32Array | number[]>,
//   ctx: CanvasRenderingContext2D,
// ) {
//   const vScale = 3;

//   if (!options) {
//     return;
//   }

//   // ctx.fillStyle = (options.waveColor as string) ?? 'white';

//   const topChannel = channelData[0];
//   const bottomChannel = channelData[1] || channelData[0];
//   const length = topChannel.length;

//   const { width, height } = ctx.canvas;
//   const halfHeight = height / 2;
//   const pixelRatio = 1;

//   const barWidth = options.barWidth ? options.barWidth * pixelRatio : 1;
//   const barGap = options.barGap
//     ? options.barGap * pixelRatio
//     : options.barWidth
//       ? barWidth / 2
//       : 0;
//   const barRadius = options.barRadius || 0;
//   const barIndexScale = width / (barWidth + barGap) / length;

//   const rectFn = barRadius && 'roundRect' in ctx ? 'roundRect' : 'rect';

//   ctx.beginPath();

//   let prevX = 0;
//   let maxTop = 0;
//   let maxBottom = 0;
//   for (let i = 0; i <= length; i++) {
//     const x = Math.round(i * barIndexScale);

//     if (x > prevX) {
//       const topBarHeight = Math.round(maxTop * halfHeight * vScale);
//       const bottomBarHeight = Math.round(maxBottom * halfHeight * vScale);
//       const barHeight = topBarHeight + bottomBarHeight || 1;

//       // Vertical alignment
//       let y = halfHeight - topBarHeight;
//       if (options.barAlign === 'top') {
//         y = 0;
//       } else if (options.barAlign === 'bottom') {
//         y = height - barHeight;
//       }

//       ctx[rectFn](
//         prevX * (barWidth + barGap),
//         y,
//         barWidth,
//         barHeight,
//         barRadius,
//       );

//       prevX = x;
//       maxTop = 0;
//       maxBottom = 0;
//     }

//     const magnitudeTop = Math.abs(topChannel[i] || 0);
//     const magnitudeBottom = Math.abs(bottomChannel[i] || 0);
//     if (magnitudeTop > maxTop) {
//       maxTop = magnitudeTop;
//     }
//     if (magnitudeBottom > maxBottom) {
//       maxBottom = magnitudeBottom;
//     }
//   }

//   ctx.fill();
//   ctx.closePath();

//   ctx.beginPath();
//   ctx.globalCompositeOperation = 'hue';
//   ctx.fillStyle = 'blue';
//   ctx.rect(0, 0, ctx.canvas.width / 4, ctx.canvas.height);
//   ctx.rect(0, 0, (ctx.canvas.width / 4) * 3, ctx.canvas.height);
//   ctx.closePath();
// }

export const Waveform = forwardRef<HTMLDivElement, WaveformProps>(
  function Waveform(
    {
      color,
      data,
      waveColor,
      trimStart,
      trimEnd,
      options,
      onMount,
      className,
      ...props
    },
    ref,
  ) {
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const ghostResizePluginRef = useRef<GhostResizePlugin | null>(null);

    const isDataExists = !!data || options?.media;

    const waveformColors = useMemo(() => {
      if (waveColor) {
        return {
          ...WAVEFORM_COLORS,
          secondary: {
            waveColor: waveColor,
            progressColor: waveColor,
          },
        };
      }

      return WAVEFORM_COLORS;
    }, [waveColor]);

    useEffect(() => {
      const container = containerRef.current;

      if (!container || wavesurferRef.current) {
        return;
      }

      ghostResizePluginRef.current = GhostResizePlugin.create({
        overlayColor: 'gray',
      });

      wavesurferRef.current = WaveSurfer.create({
        container: container,
        // renderFunction: (peaks, ctx) => renderFunction(options, peaks, ctx),
        ...waveformColors['secondary'],
        ...options,
        plugins: [ghostResizePluginRef.current],
      });

      onMount(wavesurferRef.current);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onMount]);

    useEffect(() => {
      if (!data) {
        return;
      }

      if (data instanceof Blob) {
        wavesurferRef.current?.loadBlob(
          data,
          options?.peaks,
          options?.duration,
        );
      } else {
        wavesurferRef.current?.load(data, options?.peaks, options?.duration);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
      if (!options) {
        return;
      }

      requestAnimationFrame(() => {
        wavesurferRef.current?.setOptions(options);
      });
    }, [options]);

    useEffect(() => {
      requestAnimationFrame(() => {
        wavesurferRef.current?.setOptions(waveformColors[color]);
      });
    }, [color, waveformColors]);

    useEffect(() => {
      ghostResizePluginRef.current?.setLeftGhostWidthInPercent(trimStart ?? 0);
    }, [trimStart]);

    useEffect(() => {
      ghostResizePluginRef.current?.setRightGhostWidthInPercent(trimEnd ?? 0);
    }, [trimEnd]);

    return (
      <div
        ref={(r) => {
          containerRef.current = r;

          if (typeof ref === 'function') {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }
        }}
        className={cn(
          'relative h-full',
          styles.waveform,
          {
            'flex items-center': !isDataExists,
          },
          className,
        )}
        {...props}
      >
        {!isDataExists && (
          <span className='absolute px-2'>{'Failed to load'}</span>
        )}
        {isDataExists && (
          <div
            className='absolute inset-y-0 my-auto h-px w-full'
            style={{
              backgroundColor: `${waveformColors[color].waveColor}66`,
              // width: `calc(${wavesurferRef.current?.options.width ?? 0} *
              //   ${trimDuration})`,
              left: `${trimStart}%`,
              width: `calc(100% - ${trimStart}% - ${trimEnd}%)`,
            }}
          />
        )}
      </div>
    );
  },
);

export const WaveformMemoized = memo(Waveform);
