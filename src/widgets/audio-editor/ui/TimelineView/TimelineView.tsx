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
import { Timeline } from '../Timeline';
import { TimelineHeader } from '../TimelineHeader';
import { TimelineViewFooterMemoized } from '../TimelineViewFooter';

import { TimelineViewProps } from './interfaces';

const CURSORS: Record<AudioEditorTool, string> = {
  cursor: '',
  scissors: 'url(scissors-up.svg) 16 16, auto',
  magnifier: '',
  repeat: '',
  fit: '',
  magnet: '',
  undo: '',
  redo: '',
};

export const TimelineView = observer(function TimelineView({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditor = useAudioEditor();
  const player = usePlayer();

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rectangularSelectionRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    duration: playlist.duration_in_seconds,
  });

  const cursor = useMemo(() => CURSORS[audioEditor.tool], [audioEditor.tool]);

  const handleSelectionChange = useCallback(
    (rect: Rect, e?: MouseEvent) =>
      selectTracksInSelection(
        player,
        timelineController,
        rect,
        e?.shiftKey ?? true,
      ),
    [player, timelineController],
  );

  const { isSelecting, onMouseDown } = useRectangularSelection({
    ref: rectangularSelectionRef,
    timelineController,
    onChange: handleSelectionChange,
  });

  const handleTimeSeek = useHandleTimeSeek(player, timelineController);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSelecting) {
        return;
      }

      handleTimeSeek(e);

      player.unselectAllTracks();
    },
    [handleTimeSeek, isSelecting, player],
  );

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
            onMouseUp={handleMouseUp}
            onMouseDown={onMouseDown}
            style={{ cursor }}
          >
            <RectangularSelection
              className='absolute'
              ref={rectangularSelectionRef}
              style={{ display: 'none' }}
            />
          </Timeline>
          <AudioEditorFloatingToolbarView className='absolute inset-x-0 bottom-[15px] left-[296px] z-30 mx-auto flex w-max' />
        </div>
      </div>
      <TimelineViewFooterMemoized />
    </TimelineControllerContext.Provider>
  );
});
