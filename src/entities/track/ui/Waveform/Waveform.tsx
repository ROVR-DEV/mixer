'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { cn } from '@/shared/lib';

import { WAVEFORM_COLORS } from '../../config';

import { WaveformProps } from './interfaces';
import styles from './styles.module.css';

export const Waveform = ({
  color,
  data,
  waveColor,
  options,
  onMount,
  className,
  ...props
}: WaveformProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

    wavesurferRef.current = WaveSurfer.create({
      container: container,
      ...waveformColors['secondary'],
      ...options,
    });

    onMount(wavesurferRef.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMount]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (data instanceof Blob) {
      wavesurferRef.current?.loadBlob(data, options?.peaks, options?.duration);
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

  return (
    <div
      ref={containerRef}
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
            width: wavesurferRef.current?.options.width,
          }}
        />
      )}
    </div>
  );
};

export const WaveformMemoized = memo(Waveform);
