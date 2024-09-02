'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { cn, useIsMouseClickStartsOnThisSpecificElement } from '@/shared/lib';

import {
  useTimeline,
  useHandleTimeSeek,
  usePlayer,
} from '@/entities/audio-editor';

import { AudioEditorRegionPanel } from '@/features/audio-editor-region';
import {
  TimelineEndBorder,
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
  const player = usePlayer();
  const timeline = useTimeline();

  const handleClickOnRuler = useHandleTimeSeek(player, timeline);

  const rulerControlRef = useRef<TimelineRulerRef | null>(null);

  const renderRuler = useAudioEditorTimelineRuler(rulerControlRef);

  const { onMouseDown, onClick } = useIsMouseClickStartsOnThisSpecificElement();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClick?.(e)) {
        return;
      }

      handleClickOnRuler(e);
    },
    [handleClickOnRuler, onClick],
  );

  useEffect(() => {
    if (timeline.disableListeners) {
      return;
    }

    renderRuler(
      timeline.ticks,
      timeline.zoom,
      timeline.scroll,
      timeline.timelineContainer.pixelsPerSecond,
      timeline.timelineLeftPadding,
    );
  }, [
    renderRuler,
    timeline.disableListeners,
    timeline.scroll,
    timeline.ticks,
    timeline.timelineContainer.pixelsPerSecond,
    timeline.timelineLeftPadding,
    timeline.zoom,
  ]);

  const canvasProps = useMemo(() => ({ className: 'h-[32px]' }), []);

  return (
    <div
      className={cn('w-full relative flex items-end', className)}
      ref={rulerRef}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      {...props}
    >
      <TimelinePlayHeadView className='absolute z-20' />
      <AudioEditorRegionPanel className='absolute top-[50px] z-20 h-[12px] w-full overflow-x-clip' />
      <TimelineRulerMemoized
        className='pointer-events-none w-full'
        centerLine={centerLine}
        canvasProps={canvasProps}
        controlRef={rulerControlRef}
      />
      <TimelineEndBorder />
    </div>
  );
});
