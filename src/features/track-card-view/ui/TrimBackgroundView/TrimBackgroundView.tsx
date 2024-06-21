'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { useTimelineController } from '@/entities/audio-editor';

import { TrimBackgroundViewProps } from './interfaces';

export const TrimBackgroundView = observer(function TrimBackgroundView({
  track,
  className,
  ...props
}: TrimBackgroundViewProps) {
  const timelineController = useTimelineController();

  return (
    track.isTrimming && (
      <div
        className={cn(
          'pointer-events-none box-content size-full rounded-lg border border-third-dark bg-transparent',
          className,
        )}
        style={{
          width: timelineController.timeToVirtualPixels(track.duration),
          left: -timelineController.timeToVirtualPixels(
            track.startTrimDuration,
          ),
        }}
        {...props}
      />
    )
  );
});
