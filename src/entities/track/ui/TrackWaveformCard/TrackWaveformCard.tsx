'use client';

import { memo, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useSize, cn } from '@/shared/lib';

import { TrackWaveformCardProps } from './interfaces';

export const TrackWaveformCard = ({
  track,
  trackData,
  className,
  onAddTrackBuffer,
  ...props
}: TrackWaveformCardProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const containerSize = useSize(containerRef);

  // TODO: maybe pass waver via props?
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!containerSize?.height) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!trackData) {
      return;
    }

    if (wavesurfer) {
      return;
    }

    const newWavesurfer = WaveSurfer.create({
      barWidth: 1.5,
      barGap: 2.8,
      barHeight: 3,
      width: '100%',
      height: containerSize.height,
      container: container,
      plugins: [],
      cursorColor: 'transparent',
      backend: 'WebAudio',
    });

    newWavesurfer.toggleInteraction(false);

    if (trackData instanceof Blob) {
      newWavesurfer?.loadBlob(trackData);
    } else {
      newWavesurfer?.load(trackData);
    }

    // TODO: we need to add buffers on timeline initialize at once
    onAddTrackBuffer(track.id, newWavesurfer);

    // TODO: maybe pass waver via props?
    setWavesurfer(newWavesurfer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackData, containerSize?.height]);

  return (
    <div
      className={cn(
        'flex flex-col h-[84px] py-1 border border-third-light rounded-md bg-primary',
        className,
      )}
      {...props}
      // eslint-disable-next-line no-console
      onClick={() => console.log(track)}
    >
      <span
        className='w-max px-2 text-[10px]'
        onClick={() => wavesurfer?.zoom(1)}
      >
        {track.title}
      </span>
      <div
        ref={containerRef}
        className={cn('relative h-[60px]', {
          'flex items-center': !trackData,
        })}
      >
        {!trackData && (
          <span className='absolute px-2'>{'Failed to load'}</span>
        )}
        <div id={`#waveform-${track.uuid}`} />
      </div>
      <span className='mt-auto overflow-hidden text-ellipsis text-nowrap px-2 text-[12px]'>
        <span>{'Track info: '}</span>
        <span>{'No track selected (00:00:00)'}</span>
      </span>
    </div>
  );
};

export const TrackWaveformCardMemoized = memo(TrackWaveformCard);
