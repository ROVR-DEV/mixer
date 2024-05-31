'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib';
import { IconButton } from '@/shared/ui';
import { Cross2Icon } from '@/shared/ui/assets';

import {
  AudioEditorManager,
  TimelineControllerContext,
} from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';

// eslint-disable-next-line boundaries/element-types
import { TimelineGridRef, TimelineRulerRef } from '@/features/timeline';

import {
  Timeline,
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
  const [localAudioEditorManager] = useState(
    () => new AudioEditorManager([new Channel()]),
  );

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

  useEffect(() => {
    if (!audioEditorManager.editableTrack) {
      return;
    }

    const channel = localAudioEditorManager.channels.get(
      localAudioEditorManager.channelIds[0],
    );

    localAudioEditorManager.clearTracks();
    channel?.addTrack(audioEditorManager.editableTrack);
    channel?.setMuted(true);
  }, [
    audioEditorManager.channelIds,
    audioEditorManager.editableTrack,
    audioEditorManager.selectedTrack,
    localAudioEditorManager,
  ]);

  useEffect(() => {
    if (audioEditorManager.isPlaying) {
      localAudioEditorManager.play();
    }
  }, [audioEditorManager.isPlaying, localAudioEditorManager]);

  useEffect(() => {
    timelineController.zoomController.value = Math.pow(1.25, 2);

    updateTicks(
      timelineController.zoom,
      timelineController.scroll,
      timelineController.pixelsPerSecond,
    );
    renderRuler(
      timelineController.zoom,
      timelineController.scroll,
      timelineController.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
    renderGrid(
      timelineController.scroll,
      timelineController.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
  }, [
    renderGrid,
    renderRuler,
    timelineController.pixelsPerSecond,
    timelineController.scroll,
    timelineController.timelineLeftPadding,
    timelineController.zoom,
    timelineController.zoomController,
    updateTicks,
  ]);

  useEffect(() => {
    timelineController.trackHeight = 385;
  }, [timelineController]);

  return (
    <TimelineControllerContext.Provider value={timelineController}>
      <div className={cn('flex flex-col', className)} {...props}>
        <div className='flex h-16 w-full border-t border-t-third'>
          <div className='flex min-w-[296px] items-center justify-end border-b border-b-third px-4'>
            <IconButton variant='primaryFilled' onClick={handleClose}>
              <Cross2Icon className='size-4' />
            </IconButton>
          </div>
          <TimelineHeader
            className='h-full'
            audioEditorManager={localAudioEditorManager}
            rulerRef={rulerRef}
            controlRef={rulerControlRef}
          />
        </div>
        <div className='flex w-full'>
          <div className='min-w-[296px]'></div>
          <Timeline
            audioEditorManager={localAudioEditorManager}
            timelineRef={timelineRef}
            gridRef={gridControlRef}
          />
        </div>
      </div>
    </TimelineControllerContext.Provider>
  );
};
