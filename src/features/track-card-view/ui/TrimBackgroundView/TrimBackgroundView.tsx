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
  const timeline = useTimelineController();

  return (
    track.isTrimming && (
      <div
        className={cn(
          'pointer-events-none box-content size-full rounded-lg border border-third-dark bg-transparent',
          className,
        )}
        style={{
          width: timeline.timeToVirtualPixels(track.duration),
          left: -timeline.timeToVirtualPixels(track.startTrimDuration),
        }}
        {...props}
      />
    )
  );
});
