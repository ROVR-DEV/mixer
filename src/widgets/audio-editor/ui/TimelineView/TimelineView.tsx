'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { cn, useGlobalMouseMove, useTimeLoop } from '@/shared/lib';

import {
  TRACK_HEIGHT,
  TimelineControllerContext,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarMemoized } from '@/features/audio-editor-floating-toolbar';
import { TimelineRulerRef, TimelineGridRef } from '@/features/timeline';

import {
  useAudioEditorTimelineRulerAndGrid,
  useTimelineZoomScroll,
} from '../../lib';
import { AudioEditorChannelsList } from '../AudioEditorChannelsList';
import { ChannelsListHeader } from '../ChannelsListHeader';
import { Timeline } from '../Timeline';
import { TimelineHeader } from '../TimelineHeader';
import { TimelineViewFooter } from '../TimelineViewFooter';

import { TimelineViewProps } from './interfaces';

export const TimelineView = observer(function TimelineView({
  playlist,
  audioEditorManager,
  className,
  ...props
}: TimelineViewProps) {
  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rulerRef = useRef<TimelineRulerRef | null>(null);
  const gridRef = useRef<TimelineGridRef | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    playlistTotalTime: playlist.duration_in_seconds,
  });

  const { renderGrid, renderRuler, updateTicks } =
    useAudioEditorTimelineRulerAndGrid({
      rulerRef,
      gridRef,
      timelineClientWidth: timelineController.timelineClientWidth,
    });

  const handleZoomScrollChange = useCallback(
    (zoom: number, scroll: number, pixelsPerSecond: number) => {
      updateTicks(zoom, scroll, pixelsPerSecond);
      renderRuler(
        zoom,
        scroll,
        pixelsPerSecond,
        timelineController.timelineLeftPadding,
      );
      renderGrid(
        scroll,
        pixelsPerSecond,
        timelineController.timelineLeftPadding,
      );
    },
    [
      renderGrid,
      renderRuler,
      timelineController.timelineLeftPadding,
      updateTicks,
    ],
  );

  const onTimeUpdate = useCallback(
    (delta: number) => {
      audioEditorManager.time += delta / 1000;
      audioEditorManager.updateAudioBuffer();
    },
    [audioEditorManager],
  );

  const handleMouseMovePlayHead = useCallback(
    (e: MouseEvent) => {
      audioEditorManager.seekTo(
        timelineController.realLocalPixelsToGlobal(
          timelineController.virtualToRealPixels(
            e.pageX - timelineController.startPageX,
          ),
        ),
      );
    },
    [audioEditorManager, timelineController],
  );

  const handleTimelineMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

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

  const handleClickTimeline = () => {
    audioEditorManager.setSelectedTrack(null);
  };

  useTimeLoop({
    isRunning: audioEditorManager.isPlaying,
    onUpdate: onTimeUpdate,
  });
  useGlobalMouseMove(handleMouseMovePlayHead, rulerWrapperRef);

  useEffect(() => {
    const handleZoomChange = (zoom: number) => {
      handleZoomScrollChange(
        zoom,
        timelineController.scroll,
        timelineController.pixelsPerSecond,
      );
    };

    const handleScrollChange = (scroll: number) => {
      handleZoomScrollChange(
        timelineController.zoom,
        scroll,
        timelineController.pixelsPerSecond,
      );
    };

    const handleSizeChange = () => {
      handleZoomChange(timelineController.zoom);
      handleScrollChange(timelineController.scroll);
    };

    timelineController.zoomController.addListener(handleZoomChange);
    timelineController.scrollController.addListener(handleScrollChange);
    timelineController.timelineContainer.addListener(handleSizeChange);

    return () => {
      timelineController.zoomController.removeListener(handleZoomChange);
      timelineController.scrollController.removeListener(handleScrollChange);
      timelineController.timelineContainer.removeListeners(handleSizeChange);
    };
  }, [
    handleZoomScrollChange,
    timelineController.pixelsPerSecond,
    timelineController.scroll,
    timelineController.scrollController,
    timelineController.timelineContainer,
    timelineController.zoom,
    timelineController.zoomController,
  ]);

  useEffect(() => {
    handleZoomScrollChange(
      timelineController.zoom,
      timelineController.scroll,
      timelineController.pixelsPerSecond,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TimelineControllerContext.Provider value={timelineController}>
      <div
        className={cn(
          'relative flex h-full grow flex-col overflow-hidden',
          className,
        )}
        {...props}
      >
        <div className='flex border-b border-b-secondary'>
          <ChannelsListHeader playlist={playlist} />
          <TimelineHeader
            className='pb-[9px]'
            audioEditorManager={audioEditorManager}
            rulerRef={rulerWrapperRef}
            controlRef={rulerRef}
          />
        </div>
        <div className='flex h-full grow overflow-y-auto overflow-x-hidden'>
          <AudioEditorChannelsList
            className='min-h-max min-w-[296px] grow'
            audioEditorManager={audioEditorManager}
            trackHeight={TRACK_HEIGHT}
          />
          <Timeline
            audioEditorManager={audioEditorManager}
            timelineRef={timelineRef}
            gridRef={gridRef}
            onMouseUp={handleTimelineMouseUp}
            onClick={handleClickTimeline}
          />
          <AudioEditorFloatingToolbarMemoized className='absolute inset-x-0 bottom-[15px] left-[296px] z-30 mx-auto flex w-max' />
        </div>
      </div>
      <TimelineViewFooter timelineController={timelineController} />
    </TimelineControllerContext.Provider>
  );
});
