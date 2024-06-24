'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { cn } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { useTrimMarker } from '../../lib';

import { TrimMarkerProps } from './interfaces';

export const TrimMarker = observer(
  ({ side, track, className, ...props }: TrimMarkerProps) => {
    const timelineController = useTimelineController();

    const trimMarkerProps = useTrimMarker({
      side,
      timelineController,
      track,
    });

    const cursor = useMemo(() => {
      return `url(${side === 'left' ? 'trim-icon-left.svg' : 'trim-icon-right.svg'}) 16 16, col-resize`;
    }, [side]);

    return (
      <div
        className={cn('h-1/2 w-4 bg-transparent', className)}
        style={{
          cursor,
        }}
        {...trimMarkerProps}
        {...props}
      />
    );
  },
);
