'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { cn } from '@/shared/lib';

import { useTimelineController } from '@/entities/audio-editor';

import {
  TimelinePlayHeadView,
  TimelineRulerMemoized,
} from '@/features/timeline';

import { TimelineHeaderProps } from './interfaces';

export const TimelineHeader = observer(function TimelineHeader({
  audioEditorManager,
  rulerRef,
  controlRef,
  centerLine,
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
      onClick={handleClickOnRuler}
      {...props}
    >
      <TimelinePlayHeadView
        className='absolute z-10'
        initialPosition={timelineController.timelineLeftPadding}
        audioEditorManager={audioEditorManager}
      />
      <TimelineRulerMemoized
        className='pointer-events-none w-full'
        centerLine={centerLine}
        canvasProps={{ className: 'h-[32px]' }}
        controlRef={controlRef}
      />
    </div>
  );
});
