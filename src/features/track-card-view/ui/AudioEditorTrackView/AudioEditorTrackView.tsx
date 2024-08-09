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

import {
  cn,
  preventAll,
  useIsMouseClickStartsOnThisSpecificElement,
} from '@/shared/lib';

import {
  useAudioEditor,
  useHandleTimeSeek,
  useTimeline,
} from '@/entities/audio-editor';
import { TrackCardMemoized } from '@/entities/track';

import { snapTo, useAudioEditorTrack } from '../../lib';
import { TrimBackgroundView } from '../TrimBackgroundView';

import { AudioEditorTrackViewProps } from './interfaces';

export const AudioEditorTrackView = observer(function AudioEditorTrackView({
  track,
  disableInteractive,
  editMenu: EditMenu,
  className,
  ...props
}: AudioEditorTrackViewProps) {
  const audioEditor = useAudioEditor();

  const trackRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimeline();

  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const isDraggable = useMemo(
    () => audioEditor.tool === 'cursor',
    [audioEditor.tool],
  );

  const isInteractive = useMemo(
    () => isDraggable || audioEditor.tool === 'scissors',
    [audioEditor.tool, isDraggable],
  );

  const [isEditingName, setIsEditingName] = useState(false);

  const { isDragging, onMouseUp, onMouseDown } = useAudioEditorTrack(
    trackRef,
    track,
    audioEditor,
    timeline,
    disableInteractive || !isDraggable,
  );

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

  const isSelected = useMemo(
    () => !disableInteractive && isSelectedInPlayer,
    [disableInteractive, isSelectedInPlayer],
  );

  const handleNameEdited = useCallback(
    (title: string | undefined, artist: string | undefined) => {
      runInAction(() => {
        const trimmedTitle = title?.trim();
        const trimmedArtist = artist?.trim();

        if (trimmedTitle) {
          track.meta.title = trimmedTitle;
        }

        if (trimmedArtist) {
          track.meta.artist = trimmedArtist;
        }

        setIsEditingName(false);
        audioEditor.unselectTrack(track);
        audioEditor.selectTrack(track, true);
      });
    },
    [audioEditor, track],
  );

  const handleTimeSeek = useHandleTimeSeek(audioEditor.player, timeline);

  const clickTimerRef = useRef<number | null>(null);

  const handleEdit = useCallback(() => {
    audioEditor.editableTrack = track;
  }, [audioEditor, track]);

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

      if (e.detail === 1) {
        if (audioEditor.tool === 'cursor') {
          if (disableInteractive) {
            cursorOnClick(e);
          } else {
            clickTimerRef.current = delay(cursorOnClick, 160, e);
          }
        } else if (audioEditor.tool === 'scissors') {
          const copiedTrack = track.split(
            timeline.virtualPixelsToTime(e.pageX),
          );

          audioEditor.selectTrack(copiedTrack);

          audioEditor.saveState();
        }
      } else if (e.detail === 2 && audioEditor.tool === 'cursor') {
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }

        audioEditor.selectTrack(track, e.shiftKey);
        handleEdit();
      }
    },
    [
      onElementClick,
      audioEditor,
      track,
      timeline,
      disableInteractive,
      cursorOnClick,
      handleEdit,
    ],
  );

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
        />
      ) : null,
    [EditMenu, handleRename, handleSnapLeft, handleSnapRight],
  );

  useEffect(() => {
    if (!isSelected) {
      setIsEditingName(false);
    }
  }, [isSelected]);

  const title = process.env.NEXT_PUBLIC_DEBUG_SHOW_TRACKS_ID
    ? `Track id: ${track.id}\nMeta id: ${track.meta.uuid}`
    : undefined;

  return (
    <div
      ref={trackRef}
      className={cn('absolute z-0', className, {
        'z-30': !disableInteractive && (track.isTrimming || isDragging),
        'pointer-events-none': !isInteractive,
      })}
      title={title}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
      onClick={handleClick}
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
        {...props}
      />
    </div>
  );
});
