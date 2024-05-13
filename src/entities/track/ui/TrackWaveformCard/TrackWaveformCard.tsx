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
      progressColor: '#9B9B9B',
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
        'grid grid-rows-[1fr_auto_1fr] h-[84px] border border-third-light rounded-md bg-primary',
        className,
      )}
      {...props}
    >
      <div
        ref={containerRef}
        className={cn('relative row-start-2 col-start-1 w-full h-[46px]', {
          'flex items-center': !trackData,
        })}
      >
        {!trackData && (
          <span className='absolute px-2'>{'Failed to load'}</span>
        )}
        <div className='absolute inset-y-0 my-auto h-px w-full bg-third/40' />
        <div id={`#waveform-${track.uuid}`} />
      </div>
      <span className='col-start-1 row-start-3 mt-auto overflow-hidden text-ellipsis text-nowrap px-2 text-[12px] text-third'>
        <span className='font-bold'>{`${track.title} | ${track.artist} `}</span>
        <span className=''>{`(${track.duration})`}</span>
      </span>
    </div>
  );
};

export const TrackWaveformCardMemoized = memo(TrackWaveformCard);
