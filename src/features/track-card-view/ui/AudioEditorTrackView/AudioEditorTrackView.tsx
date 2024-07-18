'use client';

import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn, preventAll } from '@/shared/lib';

import { useAudioEditor, useTimelineController } from '@/entities/audio-editor';
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

  const timeline = useTimelineController();

  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const [isEditingName, setIsEditingName] = useState(false);

  const { onMouseUp, onMouseDown } = useAudioEditorTrack(
    trackRef,
    track,
    audioEditor,
    timeline,
    disableInteractive,
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.currentTarget !== trackRef.current) {
        return;
      }

      onMouseDown?.(e);
    },
    [onMouseDown],
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

  const handleEdit = useCallback(() => {
    audioEditor.editableTrack = track;
  }, [audioEditor, track]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      if (audioEditor.tool === 'scissors') {
        const copiedTrack = track.cut(timeline.virtualPixelsToTime(e.pageX));

        audioEditor.selectTrack(copiedTrack);

        audioEditor.saveState();
        return;
      }

      audioEditor.selectTrack(track, e.shiftKey);

      if (e.detail === 2) {
        handleEdit();
      }
    },
    [audioEditor, track, timeline, handleEdit],
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

  return (
    <div
      ref={trackRef}
      className={cn('absolute z-0', className)}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
      onClick={handleClick}
    >
      <TrimBackgroundView className='absolute left-0 top-0' track={track} />
      <TrackCardMemoized
        className='size-full'
        color={track.color ?? undefined}
        track={track.meta}
        isSolo={track.channel?.isSolo}
        isSelected={isSelected}
        editPopoverContent={editMenu}
        isEditingName={isEditingName}
        onNameEdited={handleNameEdited}
        {...props}
      />
    </div>
  );
});
