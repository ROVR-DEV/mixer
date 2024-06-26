'use client';

import { observer } from 'mobx-react-lite';
import React, { useCallback, useMemo, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';

import { useAudioEditor, useTimelineController } from '@/entities/audio-editor';
import { TrackCardMemoized } from '@/entities/track';

import { snapTo, useAudioEditorTrack } from '../../lib';
import { TrimBackgroundView } from '../TrimBackgroundView';

import { AudioEditorTrackViewProps } from './interfaces';

export const AudioEditorTrackView = observer(function AudioEditorTrackView({
  track,
  player,
  disableInteractive,
  editMenu: EditMenu,
  className,
  ...props
}: AudioEditorTrackViewProps) {
  const audioEditor = useAudioEditor();

  const trackRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineController();

  const isSelectedInPlayer = player.isTrackSelected(track);

  const { onMouseUp, onMouseDown } = useAudioEditorTrack(
    trackRef,
    track,
    player,
    timelineController,
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

  const handleEdit = useCallback(() => {
    player.setEditableTrack(track);
  }, [player, track]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      if (audioEditor.tool === 'scissors') {
        const copiedTrack = track.cut(
          timelineController.virtualPixelsToTime(e.pageX),
        );
        player.selectTrack(copiedTrack);
        return;
      }

      player.selectTrack(track, e.shiftKey);

      if (e.detail === 2) {
        handleEdit();
      }
    },
    [audioEditor.tool, player, track, timelineController, handleEdit],
  );

  const handleSnapLeft = useCallback(
    () => snapTo(track, 'left', player.allTracks),
    [player.allTracks, track],
  );

  const handleSnapRight = useCallback(
    () => snapTo(track, 'right', player.allTracks),
    [player.allTracks, track],
  );

  return (
    <div
      ref={trackRef}
      className={cn('absolute z-0', className)}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
    >
      <TrimBackgroundView className='absolute left-0 top-0' track={track} />
      <TrackCardMemoized
        className='size-full'
        color={track.color ?? undefined}
        track={track.meta}
        isSolo={track.channel?.isSolo}
        isSelected={isSelected}
        onClick={handleClick}
        editPopoverContent={
          EditMenu ? (
            <EditMenu
              onSnapLeft={handleSnapLeft}
              onSnapRight={handleSnapRight}
            />
          ) : null
        }
        {...props}
      />
    </div>
  );
});
