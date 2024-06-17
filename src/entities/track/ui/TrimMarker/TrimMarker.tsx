'use client';

import { useRef } from 'react';

import { cn } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { useTrimMarker } from '../../lib';

import { TrimMarkerProps } from './interfaces';

export const TrimMarker = ({
  side,
  track,
  className,
  ...props
}: TrimMarkerProps) => {
  const trimMarkerRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineController();

  const trimMarkerProps = useTrimMarker({
    side,
    timelineController,
    track,
    markerRef: trimMarkerRef,
  });

  return (
    <div
      className={cn('h-1/2 w-4 bg-transparent cursor-col-resize', className)}
      ref={trimMarkerRef}
      {...trimMarkerProps}
      {...props}
    />
  );
};
