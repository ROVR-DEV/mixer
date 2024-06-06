'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useRef } from 'react';

import { cn, useGlobalMouseMove } from '@/shared/lib';

import {
  TimelineControllerContext,
  useAudioEditorManager,
  useHandleTimeSeek,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarMemoized } from '@/features/audio-editor-floating-toolbar';

import { useTimelineZoomScroll } from '../../lib';
import { AudioEditorChannelsList } from '../AudioEditorChannelsList';
import { ChannelsListHeaderMemoized } from '../ChannelsListHeader';
import { Timeline } from '../Timeline';
import { TimelineHeader } from '../TimelineHeader';
import { TimelineViewFooterMemoized } from '../TimelineViewFooter';

import { TimelineViewProps } from './interfaces';

export const TimelineView = observer(function TimelineView({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditorManager = useAudioEditorManager();

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    duration: playlist.duration_in_seconds,
  });

  const handleTimeSeek = useHandleTimeSeek(
    audioEditorManager,
    timelineController,
  );

  const handleClickTimeline = useCallback(() => {
    audioEditorManager.setSelectedTrack(null);
  }, [audioEditorManager]);

  useGlobalMouseMove(handleTimeSeek, rulerWrapperRef);

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
          <ChannelsListHeaderMemoized playlist={playlist} />
          <TimelineHeader className='pb-[9px]' rulerRef={rulerWrapperRef} />
        </div>
        <div className='flex h-full grow overflow-y-auto overflow-x-hidden'>
          <AudioEditorChannelsList className='min-h-max min-w-[296px] grow' />
          <Timeline
            timelineRef={timelineRef}
            onMouseUp={handleTimeSeek}
            onClick={handleClickTimeline}
          />
          <AudioEditorFloatingToolbarMemoized className='absolute inset-x-0 bottom-[15px] left-[296px] z-30 mx-auto flex w-max' />
        </div>
      </div>
      <TimelineViewFooterMemoized />
    </TimelineControllerContext.Provider>
  );
});
