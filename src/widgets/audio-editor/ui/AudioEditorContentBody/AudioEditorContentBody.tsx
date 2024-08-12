'use client';

import { observer } from 'mobx-react-lite';
import { useMemo, useRef } from 'react';
import { useOutsideClick } from 'rooks';

import { preventAll } from '@/shared/lib';
import { RectangularSelection } from '@/shared/ui';

import {
  SIDEBAR_WIDTH,
  useAudioEditor,
  useTimeline,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarView } from '@/features/audio-editor-floating-toolbar';
import {
  useTrackImportMenu,
  TrackImportMenuPopover,
} from '@/features/track-import-menu';

import {
  useAudioEditorEvents,
  useCurrentCursorIcon,
  useFloatingToolbarDnD,
} from '../../lib';
import { AudioEditorChannelsList } from '../AudioEditorChannelsList';
import { TimelineView } from '../TimelineView';
import { TimelineViewFooterMemoized } from '../TimelineViewFooter';

import { AudioEditorContentBodyProps } from './interfaces';

export const AudioEditorContentBody = observer(function AudioEditorContentBody({
  rulerWrapperRef,
  timelineRef,
  ...props
}: AudioEditorContentBodyProps) {
  const audioEditor = useAudioEditor();
  const timeline = useTimeline();

  const floatingToolbarRef = useRef<HTMLDivElement | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  const rectangularSelectionRef = useRef<HTMLDivElement | null>(null);

  const importMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    isFileUploading,
    droppedFiles,
    setDroppedFiles,
    onDrop,
    onAddToTheEnd,
    onAddToNewChannel,
  } = useTrackImportMenu(audioEditor);

  const { onMouseDown, onMouseUp } = useAudioEditorEvents(
    audioEditor,
    timeline,
    rulerWrapperRef,
    rectangularSelectionRef,
  );

  const timelineViewCursor = useCurrentCursorIcon(audioEditor.tool);

  const timelineViewProps = useMemo(
    () => ({
      onMouseDown,
      onMouseUp,
      style: { cursor: timelineViewCursor },
    }),
    [timelineViewCursor, onMouseUp, onMouseDown],
  );

  const toolbarProps = useFloatingToolbarDnD(
    floatingToolbarRef,
    timelineContainerRef,
  );

  useOutsideClick(importMenuRef, () => {
    setDroppedFiles(null);
  });

  return (
    <div className='flex size-full flex-col overflow-hidden'>
      <div
        ref={timelineContainerRef}
        className='relative size-full overflow-y-hidden'
        {...props}
      >
        <div className='relative flex size-full overflow-y-auto overflow-x-clip'>
          <AudioEditorChannelsList
            className='z-30 h-max min-h-full bg-primary'
            style={{
              minWidth: SIDEBAR_WIDTH,
            }}
          />

          <TimelineView
            timelineRef={timelineRef}
            {...timelineViewProps}
            onDragOver={preventAll}
            onDrop={onDrop}
          >
            <RectangularSelection
              className='absolute'
              ref={rectangularSelectionRef}
              style={{ display: 'none' }}
            />

            <TrackImportMenuPopover
              open={!!droppedFiles || isFileUploading}
              modal={isFileUploading}
              onAddToNewChannel={onAddToNewChannel}
              onAddToTheEnd={onAddToTheEnd}
              onClose={() => setDroppedFiles(null)}
              onReplaceExisting={() => {}}
              isFileUploading={isFileUploading}
            />
          </TimelineView>
        </div>

        <AudioEditorFloatingToolbarView
          ref={floatingToolbarRef}
          className='absolute left-[calc(50%-229.5px)] top-[calc(100%-70px)] z-50 mx-auto flex w-max'
          onMouseDown={preventAll}
          onMoveHandleMouseDown={toolbarProps.onMouseDown}
          onMoveHandleMouseUp={toolbarProps.onMouseUp}
        />
      </div>
      <TimelineViewFooterMemoized />
    </div>
  );
});
