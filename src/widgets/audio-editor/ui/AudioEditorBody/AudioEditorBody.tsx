'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';
import { RectangularSelection } from '@/shared/ui';

import {
  SIDEBAR_WIDTH,
  TimelineControllerContext,
  useAudioEditor,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarView } from '@/features/audio-editor-floating-toolbar';

import {
  useAudioEditorEvents,
  useCurrentCursorIcon,
  useFloatingToolbarDnD,
  useTimelineZoomScroll,
} from '../../lib';
import { AudioEditorChannelsList } from '../AudioEditorChannelsList';
import { ChannelsListHeaderMemoized } from '../ChannelsListHeader';
import { TimelineHeader } from '../TimelineHeader';
import { TimelineView } from '../TimelineView';
import { TimelineViewFooterMemoized } from '../TimelineViewFooter';

import { TimelineViewProps } from './interfaces';

export const AudioEditorBody = observer(function AudioEditorBody({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditor = useAudioEditor();

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const floatingToolbarRef = useRef<HTMLDivElement | null>(null);

  const rectangularSelectionRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    duration: playlist.duration_in_seconds,
  });

  const { onMouseDown, onMouseUp } = useAudioEditorEvents(
    audioEditor,
    timeline,
    rulerWrapperRef,
    rectangularSelectionRef,
  );

  const toolbarProps = useFloatingToolbarDnD(
    floatingToolbarRef,
    timelineContainerRef,
  );

  const timelineViewCursor = useCurrentCursorIcon(audioEditor.tool);

  const timelineViewProps = useMemo(
    () => ({
      onMouseUp: onMouseUp,
      onMouseDown: onMouseDown,
      style: { cursor: timelineViewCursor },
    }),
    [timelineViewCursor, onMouseDown, onMouseUp],
  );

  useEffect(() => {
    audioEditor.timeline = timeline;
  }, [audioEditor, timeline]);

  return (
    <TimelineControllerContext.Provider value={timeline}>
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
        <div
          ref={timelineContainerRef}
          className='relative flex h-full grow overflow-y-auto overflow-x-clip'
        >
          <div className='relative flex h-full grow overflow-y-auto overflow-x-clip'>
            <AudioEditorChannelsList
              className='z-30 min-h-max  grow bg-primary'
              style={{
                minWidth: SIDEBAR_WIDTH,
              }}
            />
            <TimelineView timelineRef={timelineRef} {...timelineViewProps}>
              <RectangularSelection
                className='absolute'
                ref={rectangularSelectionRef}
                style={{ display: 'none' }}
              />
            </TimelineView>
          </div>
          <AudioEditorFloatingToolbarView
            toolbarRef={floatingToolbarRef}
            className='absolute left-[calc(50%-229.5px)] top-[calc(100%-70px)] z-30 mx-auto flex w-max'
            onMouseDown={preventAll}
            onMoveHandleMouseDown={toolbarProps.onMouseDown}
            onMoveHandleMouseUp={toolbarProps.onMouseUp}
          />
        </div>
      </div>
      <TimelineViewFooterMemoized />
    </TimelineControllerContext.Provider>
  );
});
