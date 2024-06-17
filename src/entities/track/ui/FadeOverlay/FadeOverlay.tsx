'use client';

import { observer } from 'mobx-react-lite';

import { cn, preventAll } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { useFadeMarker } from '../../lib';
import { FadeMarkerMemoized } from '../FadeMarker';
import { FadeTriangleMemoized } from '../FadeTriangle';

import { FadeOverlayProps } from './interfaces';

export const FadeOverlay = observer(function FadePoint({
  track,
  side,
  className,
  ...props
}: FadeOverlayProps) {
  const timelineController = useTimelineController();

  const { position, fadeMarkerProps } = useFadeMarker({
    side,
    track,
    timelineController,
  });

  return (
    <div
      className={cn('relative h-full', className)}
      style={{
        width: side === 'left' ? position : `calc(100% - ${position}px)`,
        left: side === 'left' ? '' : position,
      }}
      onPointerOver={preventAll}
      {...props}
    >
      <FadeMarkerMemoized
        className='absolute top-[-5px] z-10'
        side={side}
        {...fadeMarkerProps}
      />
      <FadeTriangleMemoized className='absolute' side={side} />
    </div>
  );
});
