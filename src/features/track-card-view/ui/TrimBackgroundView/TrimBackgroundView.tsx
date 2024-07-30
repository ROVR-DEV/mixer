'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { useTimeline } from '@/entities/audio-editor';

import { TrimBackgroundViewProps } from './interfaces';

export const TrimBackgroundView = observer(function TrimBackgroundView({
  track,
  className,
  ...props
}: TrimBackgroundViewProps) {
  const timeline = useTimeline();

  return (
    track.isTrimming && (
      <div
        className={cn(
          'pointer-events-none size-full rounded-lg border border-third-dark bg-transparent',
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
