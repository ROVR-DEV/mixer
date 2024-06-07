'use client';

import { memo, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { cn } from '@/shared/lib';

import { WAVEFORM_COLORS } from '../../config';

import { WaveformProps } from './interfaces';
import styles from './styles.module.css';

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

  const isDataExists = !!data || options?.media;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || wavesurferRef.current) {
      return;
    }

    wavesurferRef.current = WaveSurfer.create({
      container: container,
      ...WAVEFORM_COLORS['secondary'],
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

    wavesurferRef.current?.setOptions(options);
  }, [options]);

  useEffect(() => {
    wavesurferRef.current?.setOptions(WAVEFORM_COLORS[color]);
  }, [color]);

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
        <div className='absolute inset-y-0 my-auto h-px w-full bg-third/40' />
      )}
    </div>
  );
};

export const WaveformMemoized = memo(Waveform);
