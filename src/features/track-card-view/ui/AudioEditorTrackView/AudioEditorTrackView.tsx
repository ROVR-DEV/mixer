'use client';

import { delay } from 'lodash-es';
import { runInAction } from 'mobx';
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
} from '@/shared/lib';
import { Point, Rect } from '@/shared/model';

import {
  useAudioEditor,
  useHandleTimeSeek,
  useTimeline,
} from '@/entities/audio-editor';
import { removeTrack } from '@/entities/playlist';
import { TrackCardMemoized } from '@/entities/track';

import { snapTo, useAudioEditorTrack } from '../../lib';
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

  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameEdited = useCallback(
    (title: string | undefined, artist: string | undefined) => {
      track.setTitleAndArtist(title, artist);

      setIsEditingName(false);

      // TODO: make meta information observable to do not force update it on every change
      runInAction(() => {
        audioEditor.unselectTrack(track);
        audioEditor.selectTrack(track, true);
      });
    },
    [audioEditor, track],
  );

  //#region Click handlers
  const { isDragging, onMouseUp, onMouseDown } = useAudioEditorTrack(
    trackRef,
    track,
    audioEditor,
    timeline,
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
          const copiedTrack = track.split(timeline.mapGlobalToTime(e.pageX));

          audioEditor.selectTrack(copiedTrack);

          audioEditor.saveState();
        } else if (audioEditor.tool === 'magnifier') {
          if (audioEditor.isMagnifyActivated) {
            audioEditor.unMagnify();
          } else {
            audioEditor.magnify(
              new Rect(
                track.trimStartTime * timeline.pixelsPerSecond,
                0,
                track.trimDuration * timeline.pixelsPerSecond,
                0,
              ),
            );
          }
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

  //#region Edit menu
  const handleSnapLeft = useCallback(
    () => {
      snapTo(track, 'left', audioEditor.player.tracks);
      audioEditor.saveState();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleSnapRight = useCallback(
    () => {
      snapTo(track, 'right', audioEditor.player.tracks);
      audioEditor.saveState();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleRename = useCallback(() => {
    setIsEditingName(true);
  }, []);

  const editMenu = useMemo(
    () =>
      EditMenu ? (
        <EditMenu
          onRename={handleRename}
          onSnapLeft={handleSnapLeft}
          onSnapRight={handleSnapRight}
          onClick={preventAll}
          onMouseDown={preventAll}
          onMouseUp={preventAll}
        />
      ) : null,
    [EditMenu, handleRename, handleSnapLeft, handleSnapRight],
  );
  //#endregion

  //#region Context menu
  const handleTrackRemove = useCallback(async () => {
    if (audioEditor.player.playlist?.id === undefined) {
      return;
    }

    track.channel.removeTrack(track);
    const res = await removeTrack(
      audioEditor.player.playlist.id,
      track.meta.uuid,
    );
    if (res.error) {
      track.channel.addTrack(track);
    }
    setContextMenuPosition(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditor.player.playlist?.id, track, track.meta.uuid]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      setContextMenuPosition({ x: e.pageX, y: e.pageY });
    },
    [],
  );

  const [contextMenuPosition, setContextMenuPosition] = useState<
    Point | undefined
  >(undefined);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const contextMenu = useMemo(
    () =>
      ContextMenu ? (
        <ContextMenu
          ref={contextMenuRef}
          onTrackRemove={handleTrackRemove}
          onClick={preventAll}
          onMouseDown={preventAll}
          onMouseUp={preventAll}
        />
      ) : null,
    [ContextMenu, handleTrackRemove],
  );

  useOutsideClick(contextMenuRef, () => {
    setContextMenuPosition(undefined);
  });
  //#endregion

  useEffect(() => {
    if (!isSelected) {
      setIsEditingName(false);
    }
  }, [isSelected]);

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
        'pointer-events-none': !isInteractive,
      })}
      title={title}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <TrimBackgroundView
        className='absolute left-0 top-0 z-10'
        track={track}
      />
      <TrackCardMemoized
        className='size-full'
        color={track.color ?? undefined}
        track={track.meta}
        isSolo={track.channel?.isSolo}
        isSelected={isSelected}
        hideEditButton={!isDraggable}
        isEditingName={isEditingName}
        onNameEdited={handleNameEdited}
        editPopoverContent={editMenu}
        contextMenuPosition={contextMenuPosition}
        contextMenuContent={contextMenu}
        popoverBoundary={timeline.boundingClientRect}
        {...props}
      />
    </div>
  );
});
