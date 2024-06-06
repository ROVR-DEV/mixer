'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  useTimelineController,
  useHandleTimeSeek,
  useAudioEditorManager,
} from '@/entities/audio-editor';

import {
  TimelinePlayHeadView,
  TimelineRulerMemoized,
  TimelineRulerRef,
} from '@/features/timeline';

import { useAudioEditorTimelineRuler } from '../../lib';

import { TimelineHeaderProps } from './interfaces';

export const TimelineHeader = observer(function TimelineHeader({
  rulerRef,
  centerLine,
  className,
  ...props
}: TimelineHeaderProps) {
  const audioEditorManager = useAudioEditorManager();
  const timelineController = useTimelineController();

  const handleClickOnRuler = useHandleTimeSeek(
    audioEditorManager,
    timelineController,
  );

  const rulerControlRef = useRef<TimelineRulerRef | null>(null);

  const renderRuler = useAudioEditorTimelineRuler(rulerControlRef);

  useEffect(() => {
    renderRuler(
      timelineController.ticks,
      timelineController.zoom,
      timelineController.scroll,
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
  }, [
    renderRuler,
    timelineController.scroll,
    timelineController.ticks,
    timelineController.timelineContainer.pixelsPerSecond,
    timelineController.timelineLeftPadding,
    timelineController.zoom,
  ]);

  const canvasProps = useMemo(() => ({ className: 'h-[32px]' }), []);

  return (
    <div
      className={cn('w-full relative flex items-end', className)}
      ref={rulerRef}
      onClick={handleClickOnRuler}
      {...props}
    >
      <TimelinePlayHeadView className='absolute z-10' />
      <TimelineRulerMemoized
        className='pointer-events-none w-full'
        centerLine={centerLine}
        canvasProps={canvasProps}
        controlRef={rulerControlRef}
      />
    </div>
  );
});
