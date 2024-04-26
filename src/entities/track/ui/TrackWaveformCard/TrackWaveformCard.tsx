'use client';

import { memo, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useSize, cn } from '@/shared/lib';

import { TrackWaveformCardProps } from './interfaces';

export const TrackWaveformCard = ({
  track,
  trackData,
  className,
  ...props
}: TrackWaveformCardProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const containerSize = useSize(containerRef);

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
    });

    if (trackData instanceof Blob) {
      newWavesurfer?.loadBlob(trackData);
    } else {
      newWavesurfer?.load(trackData);
    }

    setWavesurfer(newWavesurfer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackData, containerSize?.height]);

  return (
    <div
      className={cn(
        'flex flex-col h-[84px] px-2 py-1 border border-third-light rounded-md bg-primary',
        className,
      )}
      {...props}
      // eslint-disable-next-line no-console
      onClick={() => console.log(track)}
    >
      <span
        className='w-max text-[10px]'
        onClick={() => wavesurfer?.playPause()}
      >
        {track.title}
      </span>
      <div ref={containerRef} className='relative h-[60px]'>
        {!trackData && (
          <span className='absolute top-0'>{'Failed to load'}</span>
        )}
        <div id={`#waveform-${track.uuid}`} />
      </div>
      <span className='mt-auto overflow-hidden text-ellipsis text-nowrap text-[12px]'>
        <span>{'Track info: '}</span>
        <span>{'No track selected (00:00:00)'}</span>
      </span>
    </div>
  );
};

export const TrackWaveformCardMemoized = memo(TrackWaveformCard);
