'use client';

import { memo, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { resolvedTailwindConfig } from '@/shared/config';
import { cn, useSize } from '@/shared/lib';

import { WaveformProps } from './interfaces';
import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const waveColor = (resolvedTailwindConfig.theme.colors as any).primary.DEFAULT;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const waveColorSelected = (resolvedTailwindConfig.theme.colors as any).third
  .DEFAULT;

export const Waveform = ({
  color,
  data,
  options,
  onMount,
  className,
  ...props
}: WaveformProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useSize(containerRef);

  const isDataExists = !!data || options?.media;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!data) {
      return;
    }

    if (wavesurferRef.current) {
      return;
    }

    wavesurferRef.current = WaveSurfer.create({
      progressColor: waveColor,
      waveColor: waveColorSelected,
      container: container,
      interact: false,
      ...options,
    });

    if (data instanceof Blob) {
      wavesurferRef.current?.loadBlob(data, options?.peaks, options?.duration);
    } else {
      wavesurferRef.current?.load(data, options?.peaks, options?.duration);
    }

    onMount(wavesurferRef.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (options) {
      wavesurferRef.current?.setOptions(options);
    }
  }, [options]);

  useEffect(() => {
    if (containerSize) {
      if (wavesurferRef.current?.options.height === containerSize.height) {
        return;
      }
      wavesurferRef.current?.setOptions({ height: containerSize.height });
    }
  }, [containerSize]);

  useEffect(() => {
    if (color === 'primary') {
      wavesurferRef.current?.setOptions({
        waveColor: waveColor,
        progressColor: waveColor,
      });
    } else {
      wavesurferRef.current?.setOptions({
        waveColor: waveColorSelected,
        progressColor: waveColorSelected,
      });
    }
  }, [color]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full',
        styles.waveform,
        {
          'flex items-center': !data,
        },
        className,
      )}
      {...props}
    >
      {!isDataExists && (
        <span className='absolute px-2'>{'Failed to load'}</span>
      )}
      {isDataExists && (
        <div className='absolute inset-y-0 my-auto h-px w-full bg-third/40' />
      )}
    </div>
  );
};

export const WaveformMemoized = memo(Waveform);
