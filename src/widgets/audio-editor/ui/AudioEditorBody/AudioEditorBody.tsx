'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useRef } from 'react';

import {
  Rect,
  cn,
  useGlobalMouseMove,
  useRectangularSelection,
} from '@/shared/lib';
import { RectangularSelection } from '@/shared/ui';

import {
  TimelineControllerContext,
  usePlayer,
  useHandleTimeSeek,
  AudioEditorTool,
  useAudioEditor,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarView } from '@/features/audio-editor-floating-toolbar';

import { selectTracksInSelection, useTimelineZoomScroll } from '../../lib';
import { AudioEditorChannelsList } from '../AudioEditorChannelsList';
import { ChannelsListHeaderMemoized } from '../ChannelsListHeader';
import { TimelineHeader } from '../TimelineHeader';
import { TimelineView } from '../TimelineView';
import { TimelineViewFooterMemoized } from '../TimelineViewFooter';

import { TimelineViewProps } from './interfaces';

const CURSORS: Record<AudioEditorTool, string> = {
  cursor: '',
  scissors:
    'url(icons/scissors-up.svg) 16 16, url(icons/scissors-up.png) 16 16, auto',
  magnifier: '',
};

export const AudioEditorBody = observer(function AudioEditorBody({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditor = useAudioEditor();
  const player = usePlayer();

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rectangularSelectionRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    duration: playlist.duration_in_seconds,
  });

  const cursor = useMemo(() => CURSORS[audioEditor.tool], [audioEditor.tool]);

  const handleSelectionChange = useCallback(
    (rect: Rect, e?: MouseEvent) =>
      selectTracksInSelection(audioEditor, timeline, rect, e?.shiftKey ?? true),
    [audioEditor, timeline],
  );

  const { isSelecting, onMouseDown } = useRectangularSelection({
    ref: rectangularSelectionRef,
    timeline,
    onChange: handleSelectionChange,
  });

  const handleTimeSeek = useHandleTimeSeek(player, timeline);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSelecting) {
        return;
      }

      if (audioEditor.tool !== 'cursor') {
        return;
      }

      handleTimeSeek(e);

      audioEditor.unselectTracks();
    },
    [audioEditor, handleTimeSeek, isSelecting],
  );

  useGlobalMouseMove(handleTimeSeek, rulerWrapperRef);

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
        <div className='flex h-full grow overflow-y-auto overflow-x-clip'>
          <AudioEditorChannelsList className='z-30 min-h-max min-w-[296px] grow bg-primary' />
          <TimelineView
            timelineRef={timelineRef}
            onMouseUp={handleMouseUp}
            onMouseDown={onMouseDown}
            style={{ cursor }}
          >
            <RectangularSelection
              className='absolute'
              ref={rectangularSelectionRef}
              style={{ display: 'none' }}
            />
          </TimelineView>
          <AudioEditorFloatingToolbarView className='absolute inset-x-0 bottom-[15px] left-[296px] z-30 mx-auto flex w-max' />
        </div>
      </div>
      <TimelineViewFooterMemoized />
    </TimelineControllerContext.Provider>
  );
});
