'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { cn, preventAll } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimeline } from '@/entities/audio-editor';

import { useFadeData } from '../../lib';
import { DraggableFadeMarker } from '../DraggableFadeMarker';
import { FadeTriangleMemoized } from '../FadeTriangle';

import { FadeOverlayProps } from './interfaces';

export const FadeOverlay = observer(function FadePoint({
  track,
  side,
  isTrackSelected,
  className,
  ...props
}: FadeOverlayProps) {
  const timeline = useTimeline();

  const { fadeDuration, ariaAttributes } = useFadeData(track, side, timeline);

  const width = useMemo(
    () => timeline.timeToVirtualPixels(fadeDuration),
    [fadeDuration, timeline],
  );

  return (
    <div
      className={cn('relative h-full', className)}
      style={{
        width: width,
        left: side === 'left' ? '0' : '',
        right: side === 'right' ? '0' : '',
      }}
      {...props}
    >
      <DraggableFadeMarker
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
