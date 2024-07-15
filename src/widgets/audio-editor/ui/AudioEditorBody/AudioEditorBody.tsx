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
  MIN_ZOOM_WIDTH_IN_PIXELS,
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
  magnifier:
    'url(icons/magnifier.svg) 14 14, url(icons/magnifier.png) 14 14, auto',
};

export const AudioEditorBody = observer(function AudioEditorBody({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditor = useAudioEditor();
  const player = usePlayer();

  const prevZoomRef = useRef<{ zoom: number; scroll: number } | null>(null);

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
    (rect: Rect, e?: MouseEvent) => {
      if (audioEditor.tool !== 'cursor') {
        return;
      }
      selectTracksInSelection(audioEditor, timeline, rect, e?.shiftKey ?? true);
    },
    [audioEditor, timeline],
  );

  const handleSelectionEnd = useCallback(
    (rect: Rect) => {
      if (audioEditor.tool !== 'magnifier') {
        return;
      }

      const virtualRect = new Rect(
        timeline.timeToVirtualPixels(
          timeline.virtualPixelsToTime(
            rect.x +
              timeline.boundingClientRect.x +
              timeline.timelineLeftPadding,
          ),
        ),
        rect.y,
        rect.width,
        rect.height,
      );

      if (rect.width < MIN_ZOOM_WIDTH_IN_PIXELS) {
        return;
      }

      if (prevZoomRef.current === null) {
        prevZoomRef.current = { zoom: timeline.zoom, scroll: timeline.scroll };
      }

      timeline.setViewBoundsInPixels(virtualRect.left, virtualRect.right);
    },
    [audioEditor.tool, timeline],
  );

  const { isSelecting, onMouseDown } = useRectangularSelection({
    ref: rectangularSelectionRef,
    timeline,
    onChange: handleSelectionChange,
    onEnd: handleSelectionEnd,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseDown?.(e);
    },
    [onMouseDown],
  );

  const handleTimeSeek = useHandleTimeSeek(player, timeline);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSelecting) {
        return;
      }

      if (
        audioEditor.tool === 'magnifier' &&
        prevZoomRef.current !== null &&
        !isSelecting
      ) {
        timeline.zoom = prevZoomRef.current.zoom;
        timeline.scroll = prevZoomRef.current.scroll;
        prevZoomRef.current = null;
      }

      if (audioEditor.tool !== 'cursor') {
        return;
      }

      handleTimeSeek(e);

      audioEditor.unselectTracks();
    },
    [audioEditor, handleTimeSeek, isSelecting, timeline],
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
            onMouseDown={handleMouseDown}
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
