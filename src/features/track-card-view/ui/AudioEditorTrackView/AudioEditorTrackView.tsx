'use client';

import { delay } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useOutsideClick } from 'rooks';

import {
  cn,
  preventAll,
  useIsMouseClickStartsOnThisSpecificElement,
  useWindowEvent,
} from '@/shared/lib';
import { Point, Rect } from '@/shared/model';

import {
  useAudioEditor,
  useHandleTimeSeek,
  useTimeline,
} from '@/entities/audio-editor';
import { TrackCardMemoized, TrackModifyOverlay } from '@/entities/track';

import { useAudioEditorTrack, useTrackEditMenuHandlers } from '../../lib';
import { TrimBackgroundView } from '../TrimBackgroundView';

import { AudioEditorTrackViewProps } from './interfaces';

export const AudioEditorTrackView = observer(function AudioEditorTrackView({
  track,
  disableInteractive,
  editMenu: EditMenu,
  contextMenu: ContextMenu,
  className,
  ...props
}: AudioEditorTrackViewProps) {
  const audioEditor = useAudioEditor();
  const timeline = useTimeline();

  const [fadePosition, setFadePosition] = useState({
    right: 0,
    left: 0,
  });
  const trackRef = useRef<HTMLDivElement | null>(null);

  const isDraggable = useMemo(
    () => audioEditor.tool === 'cursor',
    [audioEditor.tool],
  );

  const isInteractive = useMemo(
    () =>
      isDraggable ||
      audioEditor.tool === 'scissors' ||
      audioEditor.tool === 'magnifier',
    [audioEditor.tool, isDraggable],
  );

  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const isSelected = useMemo(
    () => !disableInteractive && isSelectedInPlayer,
    [disableInteractive, isSelectedInPlayer],
  );

  const handleNameEdited = useCallback(
    (title: string | undefined, artist: string | undefined) => {
      track.setTitleAndArtist(title, artist);
      track.isEditingTitle = false;
    },
    [track],
  );
  const changeFadePosition = (left: number, right: number) =>
    setFadePosition({ left, right });

  //#region Click handlers
  const { isDragging, onMouseUp, onMouseDown } = useAudioEditorTrack(
    trackRef,
    track,
    audioEditor,
    timeline,
    changeFadePosition,
    disableInteractive || !isDraggable,
  );

  const [isDraggedBefore, setIsDraggedBefore] = useState(false);

  useEffect(() => {
    if (isDragging) {
      setIsDraggedBefore(true);
    }
  }, [isDragging]);

  const { onClick: onElementClick, onMouseDown: onElementMouseDown } =
    useIsMouseClickStartsOnThisSpecificElement();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);
      if (e.currentTarget !== trackRef.current) {
        return;
      }

      onElementMouseDown?.(e);
      onMouseDown?.(e);
    },
    [onElementMouseDown, onMouseDown],
  );

  const clickTimerRef = useRef<number | null>(null);

  const handleTimeSeek = useHandleTimeSeek(audioEditor.player, timeline);

  const cursorOnClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      audioEditor.selectTrack(track, e.shiftKey);
      handleTimeSeek(e);
    },
    [audioEditor, handleTimeSeek, track],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      if (!onElementClick?.(e)) {
        return;
      }

      if (isDraggedBefore) {
        setIsDraggedBefore(false);
        return;
      }

      if (e.detail === 1) {
        if (audioEditor.tool === 'cursor') {
          if (disableInteractive) {
            cursorOnClick(e);
          } else {
            clickTimerRef.current = delay(cursorOnClick, 160, e);
          }
        } else if (audioEditor.tool === 'scissors') {
          const copiedTrack = track.split(timeline.globalToTime(e.pageX));

          if (!copiedTrack) {
            return;
          }
          audioEditor.selectTrack(copiedTrack);

          audioEditor.saveState();
        } else if (audioEditor.tool === 'magnifier') {
          audioEditor.magnify(
            new Rect(
              timeline.timeToGlobal(track.trimStartTime),
              0,
              timeline.timeToGlobal(track.trimDuration),
              0,
            ),
          );
        }
      }
    },
    [
      onElementClick,
      audioEditor,
      disableInteractive,
      isDraggedBefore,
      cursorOnClick,
      track,
      timeline,
    ],
  );

  const handleEdit = useCallback(() => {
    audioEditor.editableTrack = track;
  }, [audioEditor, track]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (audioEditor.tool === 'cursor') {
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }

        audioEditor.selectTrack(track, e.shiftKey);
        handleEdit();
      }
    },
    [audioEditor, handleEdit, track],
  );
  //#endregion

  const editMenuHandlers = useTrackEditMenuHandlers(audioEditor, track);
  const editMenu = useMemo(
    () => (EditMenu ? <EditMenu {...editMenuHandlers} /> : null),
    [EditMenu, editMenuHandlers],
  );

  //#region Context menu

  const isRightClickOnTrackRef = useRef(false);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      isRightClickOnTrackRef.current = true;
      setContextMenuPosition({ x: e.pageX, y: e.pageY });
    },
    [],
  );

  const [contextMenuPosition, setContextMenuPosition] = useState<
    Point | undefined
  >(undefined);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const contextMenu = useMemo(
    () => ContextMenu && <ContextMenu ref={contextMenuRef} track={track} />,
    [ContextMenu, track],
  );

  useOutsideClick(contextMenuRef, () => {
    setContextMenuPosition(undefined);
  });

  // TODO: refactor
  useWindowEvent('contextmenu', () => {
    if (isRightClickOnTrackRef.current) {
      isRightClickOnTrackRef.current = false;
      return;
    }

    setContextMenuPosition(undefined);
  });
  //#endregion

  // Stop editing track title if track unselected
  useEffect(() => {
    if (!isSelected) {
      track.isEditingTitle = false;
    }
  }, [isSelected, track]);

  // Debug
  const title = process.env.NEXT_PUBLIC_DEBUG_SHOW_TRACKS_ID
    ? `Track id: ${track.id}\nMeta id: ${track.meta.uuid}`
    : undefined;

  return (
    <div
      ref={trackRef}
      className={cn('absolute z-0', className, {
        // Push track up when dragging over timeline
        'z-30': !disableInteractive && (track.isTrimming || isDragging),
        // Disable interaction, example in track editor
        'pointer-events-none': !isInteractive,
      })}
      title={title}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {track.isTrimming && (
        <TrimBackgroundView
          className='absolute left-0 top-0 z-10'
          track={track}
        />
      )}
      <TrackCardMemoized
        className='size-full'
        color={track.color ?? undefined}
        track={track.meta}
        isSolo={track.channel?.isSolo}
        isSelected={isSelected}
        hideEditButton={!isDraggable}
        isEditingName={track.isEditingTitle}
        onNameEdited={handleNameEdited}
        editPopoverContent={editMenu}
        contextMenuPosition={contextMenuPosition}
        contextMenuContent={contextMenu}
        popoverBoundary={timeline.boundingClientRect}
        {...props}
      />
      <TrackModifyOverlay
        track={track}
        trackRef={trackRef}
        fadePosition={fadePosition}
        ignoreSelection={props.ignoreSelection}
      />
    </div>
  );
});
