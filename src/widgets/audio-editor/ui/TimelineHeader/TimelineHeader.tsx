'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import {
  cn,
  useGlobalMouseMove,
  useIsMouseClickStartsOnThisSpecificElement,
  useWindowEvent,
} from '@/shared/lib';

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
  useTimelineWheelHandler,
} from '@/features/timeline';

import { useAudioEditorTimelineRuler } from '../../lib';

import { TimelineHeaderProps } from './interfaces';

const TIMELINE_RULER_IN_HEADER_CANVAS_PROPS = { className: 'h-[32px]' };

export const TimelineHeader = observer(function TimelineHeader({
  centerLine,
  endBorder,
  className,
  ...props
}: TimelineHeaderProps) {
  const player = usePlayer();
  const timeline = useTimeline();

  const handleClickOnRuler = useHandleTimeSeek(player, timeline);

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const rulerControlRef = useRef<TimelineRulerRef | null>(null);

  const renderDefaultRuler = useAudioEditorTimelineRuler(rulerControlRef);

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

  const renderRuler = useCallback(() => {
    if (timeline.disableListeners) {
      return;
    }

    renderDefaultRuler(
      timeline.ticks,
      timeline.zoom,
      timeline.hScroll,
      timeline.hPixelsPerSecond,
      timeline.zeroMarkOffsetX,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderDefaultRuler, timeline.ticks]);

  useEffect(() => {
    renderRuler();
  }, [
    renderRuler,
    timeline.disableListeners,
    timeline.hScroll,
    timeline.ticks,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffsetX,
    timeline.zoom,
  ]);

  const handleTimeSeek = useHandleTimeSeek(player, timeline);

  useTimelineWheelHandler(rulerWrapperRef, timeline);
  useGlobalMouseMove(handleTimeSeek, rulerWrapperRef);

  useWindowEvent('resize', renderRuler);

  return (
    <div
      className={cn('w-full relative flex items-end', className)}
      ref={rulerWrapperRef}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      {...props}
    >
      <TimelinePlayHeadView className='absolute z-20' />
      <AudioEditorRegionPanel className='absolute bottom-px z-20 h-[12px] w-full overflow-x-hidden' />
      <TimelineRulerMemoized
        className='pointer-events-none w-full'
        centerLine={centerLine}
        canvasProps={TIMELINE_RULER_IN_HEADER_CANVAS_PROPS}
        controlRef={rulerControlRef}
      />
      {!endBorder ? null : <TimelineEndBorder />}
    </div>
  );
});
