'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import { useTimeline } from '@/entities/audio-editor';

import { TrimBackgroundViewProps } from './interfaces';

export const TrimBackgroundView = observer(function TrimBackgroundView({
  track,
  className,
  ...props
}: TrimBackgroundViewProps) {
  const timeline = useTimeline();

  const ref = useRef<HTMLDivElement | null>(null);

  const update = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const startXGlobal = timeline.timeToGlobal(track.startTime);
    const endXGlobal = timeline.timeToGlobal(track.endTime);

    const trimStartXGlobal = timeline.timeToGlobal(track.trimStartTime);

    const startXClamped = Math.max(
      startXGlobal,
      timeline.viewportBoundsWithBuffer.start,
    );
    const endXClamped = Math.min(
      endXGlobal,
      timeline.viewportBoundsWithBuffer.end,
    );

    const trimStartXClamped = Math.max(
      trimStartXGlobal,
      timeline.viewportBoundsWithBuffer.start,
    );

    const width = endXClamped - startXClamped;
    const left = trimStartXClamped - startXClamped;

    ref.current.style.width = `${width}px`;
    ref.current.style.left = `${-left}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeline,
    timeline.viewportBoundsWithBuffer.end,
    timeline.viewportBoundsWithBuffer.start,
    track.trimStartTime,
    track.trimEndTime,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffsetX,
  ]);

  return (
    <div
      ref={ref}
      className={cn(
        'absolute pointer-events-none size-full rounded-lg border border-third-dark bg-transparent',
        className,
      )}
      {...props}
    />
  );
});
