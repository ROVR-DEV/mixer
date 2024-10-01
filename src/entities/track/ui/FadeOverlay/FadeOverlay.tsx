'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { cn, preventAll, stopPropagation } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimeline } from '@/entities/audio-editor';

import { useFadeData } from '../../lib';
import { FadeTriangleMemoized } from '../FadeTriangle';
import { TrackFadeMarker } from '../TrackFadeMarker';

import { FadeOverlayProps } from './interfaces';

export const FadeOverlay = observer(function FadeOverlay({
  track,
  side,
  isTrackSelected,
  className,
  position,
  ...props
}: FadeOverlayProps) {
  const timeline = useTimeline();

  const { fadeDuration, ariaAttributes } = useFadeData(track, side);

  const width = useMemo(
    () => timeline.timeToPixels(fadeDuration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fadeDuration, timeline, timeline.hPixelsPerSecond],
  );

  return (
    <div
      className={cn('absolute h-full', className)}
      style={{
        width: width,
        left: side === 'left' ? position : '',
        right: side === 'right' ? position : '',
      }}
      onClick={stopPropagation}
      {...props}
    >
      <TrackFadeMarker
        className='absolute z-10'
        track={track}
        side={side}
        onClick={preventAll}
        onMouseUp={preventAll}
        onMouseDown={preventAll}
        {...ariaAttributes}
      />
      <FadeTriangleMemoized
        className='absolute'
        variant={isTrackSelected ? 'dark' : 'light'}
        side={side}
      />
    </div>
  );
});
