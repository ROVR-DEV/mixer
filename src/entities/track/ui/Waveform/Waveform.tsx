'use client';

import { memo, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { cn, useSize } from '@/shared/lib';

import { WaveformProps } from './interfaces';

export const Waveform = ({
  color,
  data,
  peaks,
  duration,
  options,
  onMount,
  className,
  ...props
}: WaveformProps) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useSize(containerRef);

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
      cursorColor: 'transparent',
      progressColor: '#9B9B9B',
      waveColor: '#9B9B9B',
      container: container,
      interact: false,
      ...options,
    });

    if (data instanceof Blob) {
      wavesurferRef.current?.loadBlob(data, peaks, duration);
    } else {
      wavesurferRef.current?.load(data, peaks, duration);
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
        waveColor: '#161616',
        progressColor: '#161616',
      });
    } else {
      wavesurferRef.current?.setOptions({
        waveColor: '#9B9B9B',
        progressColor: '#9B9B9B',
      });
    }
  }, [color]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full',
        {
          'flex items-center': !data,
        },
        className,
      )}
      {...props}
    >
      {!data && <span className='absolute px-2'>{'Failed to load'}</span>}
      <div className='absolute inset-y-0 my-auto h-px w-full bg-third/40' />
    </div>
  );
};

export const WaveformMemoized = memo(Waveform);
