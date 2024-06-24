'use client';

import { observer } from 'mobx-react-lite';

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

    return (
      <div
        className={cn('h-1/2 w-4 bg-transparent', className)}
        style={{
          cursor: 'url(trim-icon.svg), col-resize',
        }}
        {...trimMarkerProps}
        {...props}
      />
    );
  },
);
