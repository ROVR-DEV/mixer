'use client';

import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';
import { IconButton } from '@/shared/ui';
import { Cross2Icon } from '@/shared/ui/assets';

import { TimelineControllerContext } from '@/entities/audio-editor';

// eslint-disable-next-line boundaries/element-types
import { ChannelListItemView } from '@/features/channel-control';
// eslint-disable-next-line boundaries/element-types
import { TimelineGridRef, TimelineRulerRef } from '@/features/timeline';
// eslint-disable-next-line boundaries/element-types
import { TrackCardView } from '@/features/track-card-view';

import {
  TimelineHeader,
  useAudioEditorTimelineRulerAndGrid,
  useTimelineZoomScroll,
  // eslint-disable-next-line boundaries/element-types
} from '@/widgets/audio-editor';

import { TrackEditorProps } from './interfaces';

export const TrackEditor = ({
  audioEditorManager,
  className,
  ...props
}: TrackEditorProps) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rulerControlRef = useRef<TimelineRulerRef | null>(null);
  const gridControlRef = useRef<TimelineGridRef | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerRef,
    playlistTotalTime: audioEditorManager.selectedTrack?.duration ?? 0,
  });

  const { renderGrid, renderRuler, updateTicks } =
    useAudioEditorTimelineRulerAndGrid({
      rulerRef: rulerControlRef,
      gridRef: gridControlRef,
      timelineClientWidth: timelineController.timelineClientWidth,
    });

  const handleClose = useCallback(() => {
    audioEditorManager.setEditableTrack(null);
  }, [audioEditorManager]);

  const updateTimeline = useCallback(() => {
    updateTicks(
      timelineController.zoom,
      timelineController.scroll,
      timelineController.timelineContainer.pixelsPerSecond,
    );
    renderRuler(
      timelineController.zoom,
      timelineController.scroll,
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
    renderGrid(
      timelineController.scroll,
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
  }, [
    renderGrid,
    renderRuler,
    timelineController.scroll,
    timelineController.timelineContainer.pixelsPerSecond,
    timelineController.timelineLeftPadding,
    timelineController.zoom,
    updateTicks,
  ]);

  useEffect(() => {
    // timelineController.zoomController.value = Math.pow(1.25, 2);
    updateTimeline();
  }, [updateTimeline]);

  useEffect(() => {
    timelineController.zoomController.addListener(updateTimeline);
    timelineController.scrollController.addListener(updateTimeline);
    timelineController.timelineContainer.addListener(updateTimeline);

    return () => {
      timelineController.zoomController.removeListener(updateTimeline);
      timelineController.scrollController.removeListener(updateTimeline);
      timelineController.timelineContainer.removeListeners(updateTimeline);
    };
  }, [
    timelineController.scrollController,
    timelineController.timelineContainer,
    timelineController.zoomController,
    updateTimeline,
  ]);

  const handleClickOnTimeline = useCallback(
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

  useEffect(() => {
    if (!audioEditorManager.editableTrack) {
      return;
    }

    timelineController.scroll =
      audioEditorManager.editableTrack.currentStartTime;
    updateTimeline();
  }, [audioEditorManager.editableTrack, timelineController, updateTimeline]);

  return (
    <TimelineControllerContext.Provider value={timelineController}>
      <div
        className={cn(
          'flex flex-col bg-primary border-b border-b-third',
          className,
        )}
        {...props}
      >
        <div className='flex h-16 min-h-16 w-full border-t border-t-third'>
          <div className='flex min-w-[296px] items-center justify-end border-b border-b-third px-4'>
            <IconButton variant='primaryFilled' onClick={handleClose}>
              <Cross2Icon className='size-4' />
            </IconButton>
          </div>
          <TimelineHeader
            className='h-full'
            audioEditorManager={audioEditorManager}
            rulerRef={rulerRef}
            controlRef={rulerControlRef}
            centerLine={false}
          />
        </div>
        <div className='flex size-full'>
          <div className='min-w-[296px] border-r border-r-secondary'></div>
          <div
            className='size-full overflow-x-clip'
            ref={timelineRef}
            onMouseUp={handleClickOnTimeline}
          >
            {!audioEditorManager.editableTrack ? null : (
              <ChannelListItemView
                className='relative size-full'
                audioEditorManager={audioEditorManager}
                channel={audioEditorManager.editableTrack?.channel}
                ignoreSelection
              >
                <TrackCardView
                  className='pointer-events-none h-[calc(100%-14px)]'
                  key={`track-${audioEditorManager.editableTrack.uuid}-editable`}
                  track={audioEditorManager.editableTrack}
                  audioEditorManager={audioEditorManager}
                  ignoreSelection
                />
              </ChannelListItemView>
            )}
          </div>
        </div>
      </div>
    </TimelineControllerContext.Provider>
  );
};
