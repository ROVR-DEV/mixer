'use client';

import { memo, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { cn } from '@/shared/lib/cn';
import { useSize } from '@/shared/lib/useSize';

import { getTrack } from '../../api';

import { TrackWaveformCardProps } from './interfaces';

export const TrackWaveformCard = ({
  track,
  enabled = true,
  className,
  ...props
}: TrackWaveformCardProps) => {
  const [trackBlobData, setTrackBlobData] = useState<{
    data: Blob | undefined;
    error: Error | undefined;
  }>({ data: undefined, error: undefined });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!enabled) {
      return;
    }

    if (trackBlobData.data) {
      return;
    }

    (async () => {
      const blob = await getTrack(track.uuid);

      setTrackBlobData(blob);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, track.uuid]);

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

    const wavesurfer = WaveSurfer.create({
      barWidth: 1.5,
      barGap: 2.8,
      barHeight: 3,
      width: '100%',
      height: containerSize.height,
      container: container,
      plugins: [],
      cursorColor: 'transparent',
    });

    setWavesurfer(wavesurfer);
  }, [containerSize?.height]);

  useEffect(() => {
    if (!trackBlobData.data) {
      return;
    }

    wavesurfer?.loadBlob(trackBlobData.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackBlobData]);

  return (
    <div
      className={cn(
        'flex flex-col h-[84px] px-2 py-1 border border-third-light rounded-md',
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
        {trackBlobData.error && (
          <span className='absolute top-0'>{trackBlobData.error.message}</span>
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
