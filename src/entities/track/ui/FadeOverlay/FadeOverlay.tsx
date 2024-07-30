'use client';

import { observer } from 'mobx-react-lite';

import { cn, preventAll } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimeline } from '@/entities/audio-editor';

import { useFadeMarker } from '../../lib';
import { FadeMarkerMemoized } from '../FadeMarker';
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

  const { width, fadeMarkerProps } = useFadeMarker({
    side,
    track,
    timeline,
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
      <FadeTriangleMemoized
        className='absolute'
        variant={isTrackSelected ? 'dark' : 'light'}
        side={side}
      />
    </div>
  );
});
