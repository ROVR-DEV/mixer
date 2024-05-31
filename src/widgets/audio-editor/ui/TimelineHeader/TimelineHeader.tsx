'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { cn } from '@/shared/lib';

import {
  TIMELINE_LEFT_PADDING,
  useTimelineController,
} from '@/entities/audio-editor';

import {
  TimelinePlayHeadView,
  TimelineRulerMemoized,
} from '@/features/timeline';

import { TimelineHeaderProps } from './interfaces';

export const TimelineHeader = observer(function TimelineHeader({
  audioEditorManager,
  rulerRef,
  controlRef,
  className,
  ...props
}: TimelineHeaderProps) {
  const timelineController = useTimelineController();

  const handleClickOnRuler = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      audioEditorManager.seekTo(
        timelineController.realLocalPixelsToGlobal(
          timelineController.virtualToRealPixels(
            e.nativeEvent.pageX - timelineController.startPageX,
          ),
        ),
      );
    },
    [audioEditorManager, timelineController],
  );

  return (
    <div
      className={cn('w-full relative flex items-end', className)}
      ref={rulerRef}
      {...props}
    >
      <TimelinePlayHeadView
        className='absolute z-10'
        initialPosition={TIMELINE_LEFT_PADDING}
        audioEditorManager={audioEditorManager}
      />
      <TimelineRulerMemoized
        className='w-full'
        canvasProps={{ className: 'h-[32px]' }}
        onClick={handleClickOnRuler}
        controlRef={controlRef}
      />
    </div>
  );
});
