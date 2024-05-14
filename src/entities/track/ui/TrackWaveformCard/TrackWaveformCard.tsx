'use client';

import { memo, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useSize, cn } from '@/shared/lib';
import { Badge, Button } from '@/shared/ui';

import { TrackWaveformCardProps } from './interfaces';

export const TrackWaveformCard = ({
  track,
  trackData,
  className,
  onAddTrackBuffer,
  isSelected,
  isSolo,
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
      waveColor: '#9B9B9B',
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

  useEffect(() => {
    if (!wavesurfer) {
      return;
    }

    if (isSelected) {
      wavesurfer.setOptions({ waveColor: '#161616', progressColor: '#161616' });
    } else {
      wavesurfer.setOptions({ waveColor: '#9B9B9B', progressColor: '#9B9B9B' });
    }
  }, [isSelected, wavesurfer]);

  return (
    <div
      className={cn(
        'relative grid grid-rows-[1fr_auto_1fr] h-[84px] border transition-colors border-third-light text-third rounded-md bg-primary',
        className,
        { 'bg-accent !text-primary': isSelected },
        { 'border-accent': isSolo || isSelected },
      )}
      {...props}
    >
      <Button
        className={cn('absolute hidden left-1.5 top-1.5 p-0', {
          flex: isSelected,
        })}
      >
        <Badge
          variant='inverse'
          className={cn(
            'w-16 h-[22px] z-10 bg-accent/80 rounded-md uppercase p-0 pt-[3px] text-[12px] font-bold items-center justify-center  flex',
          )}
        >
          {'Edit'}
        </Badge>
      </Button>
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
      <span className='col-start-1 row-start-3 mt-auto overflow-hidden text-ellipsis text-nowrap pl-1 text-[12px]'>
        <span className='font-bold'>{`${track.title} | ${track.artist} `}</span>
        <span className=''>{`(${track.duration})`}</span>
      </span>
    </div>
  );
};

export const TrackWaveformCardMemoized = memo(TrackWaveformCard);
