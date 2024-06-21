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

  const { width, fadeMarkerProps } = useFadeMarker({
    side,
    track,
    timelineController,
  });

  return (
    <div
      className={cn('relative h-full', className)}
      style={{
        width: width,
        left: side === 'left' ? '0' : '',
        right: side === 'right' ? '0' : '',
      }}
      onPointerOver={preventAll}
      {...props}
    >
      <FadeMarkerMemoized
        className='absolute z-10'
        side={side}
        {...fadeMarkerProps}
      />
      <FadeTriangleMemoized className='absolute' side={side} />
    </div>
  );
});
