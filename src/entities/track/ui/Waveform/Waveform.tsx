'use client';

import { forwardRef, memo, useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { cn, GhostResizePlugin } from '@/shared/lib';

import { WAVEFORM_COLORS } from '../../config';

import { WaveformProps } from './interfaces';
import styles from './styles.module.css';

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
