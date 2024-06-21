'use client';

import { values } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { clamp, cn, preventAll } from '@/shared/lib';

import {
  TIMELINE_LEFT_PADDING,
  useTimelineController,
} from '@/entities/audio-editor';
import { TrackCardMemoized } from '@/entities/track';

// eslint-disable-next-line boundaries/element-types
import { TrackEditMenu } from '@/features/track-edit-menu';

import {
  adjustTracksOnPaste,
  clearDragProperties,
  getTrackCoordinates,
  setDragProperties,
  setDragSettings,
} from '../../lib';

import { AudioEditorTrackViewProps } from './interfaces';
import styles from './styles.module.css';

export const AudioEditorTrackView = observer(function AudioEditorTrackView({
  track,
  audioEditorManager,
  disableInteractive,
  className,
  ...props
}: AudioEditorTrackViewProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const timelineController = useTimelineController();

  const isSelectedInEditor = audioEditorManager.isTrackSelected(track);

  const isSelected = useMemo(
    () => !disableInteractive && isSelectedInEditor,
    [disableInteractive, isSelectedInEditor],
  );

  const handleEdit = useCallback(() => {
    audioEditorManager.setEditableTrack(track);
  }, [audioEditorManager, track]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      audioEditorManager.selectTrack(track, e.shiftKey);

      if (e.detail === 2) {
        handleEdit();
      }
    },
    [audioEditorManager, handleEdit, track],
  );

  const { trackWidth, trackStartXGlobal, trackEndXGlobal } = useMemo(
    () =>
      getTrackCoordinates(
        track.trimStartTime,
        track.trimEndTime,
        timelineController.timelineContainer.pixelsPerSecond,
      ),
    [
      track.trimStartTime,
      track.trimEndTime,
      timelineController.timelineContainer.pixelsPerSecond,
    ],
  );

  const globalToLocalCoordinates = useCallback(
    (globalX: number) => {
      const virtualScrollOffsetX =
        timelineController.scroll *
        timelineController.timelineContainer.pixelsPerSecond;
      return globalX - virtualScrollOffsetX;
    },
    [
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.scroll,
    ],
  );

  const updateTrackWidth = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    if (trackRef.current.style.width === `${trackWidth}px`) {
      return;
    }

    trackRef.current.style.width = `${trackWidth}px`;
  }, [trackWidth]);

  const updateTrackVisibility = useCallback(
    (scroll: number, pixelsPerSecond: number, timelineClientWidth: number) => {
      if (!trackRef.current) {
        return;
      }

      const virtualScrollOffsetX = scroll * pixelsPerSecond;
      const bufferViewWidth = 400;

      const isVisible =
        trackStartXGlobal <
          timelineClientWidth + virtualScrollOffsetX + bufferViewWidth &&
        trackEndXGlobal > virtualScrollOffsetX - bufferViewWidth;

      if (isVisible) {
        trackRef.current.classList.remove(styles.hiddenTrack);
      } else {
        trackRef.current.classList.add(styles.hiddenTrack);
      }
    },
    [trackEndXGlobal, trackStartXGlobal],
  );

  const updateTrackShiftFromLeft = useCallback(
    (timelineLeftPadding: number) => {
      if (!trackRef.current) {
        return;
      }

      const shiftFromLeft = globalToLocalCoordinates(
        trackStartXGlobal + timelineLeftPadding,
      );
      trackRef.current.style.left = `${shiftFromLeft}px`;
    },
    [globalToLocalCoordinates, trackStartXGlobal],
  );

  const updateTrackPosition = useCallback(
    (scroll: number, pixelsPerSecond: number, timelineClientWidth: number) => {
      // TODO: performance issue
      // if (track.audioBuffer?.options.minPxPerSec !== pixelsPerSecond) {
      //   requestAnimationFrame(() => {
      //     track.audioBuffer?.setOptions({ minPxPerSec: pixelsPerSecond });
      //   });
      // }

      updateTrackWidth();
      updateTrackShiftFromLeft(TIMELINE_LEFT_PADDING);
      updateTrackVisibility(scroll, pixelsPerSecond, timelineClientWidth);
    },
    [updateTrackShiftFromLeft, updateTrackVisibility, updateTrackWidth],
  );

  const calcNewStartTime = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const leftTimeBound = Number(e.currentTarget.dataset.leftBound);

      const startTime = Number(e.currentTarget.dataset.startTime);

      const startX = Number(e.currentTarget.dataset.startX);
      const timeOffset =
        (e.pageX - startX) /
        timelineController.timelineContainer.pixelsPerSecond;

      return clamp(startTime + timeOffset, leftTimeBound);
    },
    [timelineController.timelineContainer.pixelsPerSecond],
  );

  const prevChannelId = useRef<string | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      audioEditorManager.selectTrack(track);
      setDragSettings(e);

      e.dataTransfer.setData('text/trackId', track.uuid);
      e.dataTransfer.setData('text/channelId', track.channel.id);

      prevChannelId.current = track.channel.id;

      setDragProperties(e, track.trimStartTime);

      track.isDragging = true;
    },
    [audioEditorManager, track],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const startTime = calcNewStartTime(e);

      if (track.startTime === startTime) {
        return;
      }

      const grid = (e.target as HTMLElement).parentElement?.parentElement
        ?.parentElement;

      const paneOffsetY = 196 - (grid?.scrollTop ?? 0);

      const globalChannelIndex = Math.floor(
        (Number(e.pageY) - paneOffsetY) / 96,
      );

      if (
        globalChannelIndex >= 0 &&
        globalChannelIndex < audioEditorManager.channelIds.length
      ) {
        const currentChannelIndex = Math.floor(
          Math.floor(Number(e.currentTarget.dataset.startY) - paneOffsetY) / 96,
        );

        const currentChannel = audioEditorManager.channels.get(
          audioEditorManager.channelIds[globalChannelIndex],
        )!;

        if (track.channel.id !== currentChannel.id) {
          track.channel = currentChannel;
        }

        const channelOffset = globalChannelIndex - currentChannelIndex;

        e.currentTarget.style.top = channelOffset * 96 + 6 + 'px';
      }

      if (track.trimStartTime === startTime) {
        return;
      }

      track.setStartTime(startTime);
      track.audioBuffer?.setTime(audioEditorManager.time - track.startTime);
    },
    [
      audioEditorManager.channelIds,
      audioEditorManager.channels,
      audioEditorManager.time,
      calcNewStartTime,
      track,
    ],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      track.isDragging = false;

      track.setStartTime(calcNewStartTime(e));
      clearDragProperties(e);

      if (prevChannelId.current) {
        if (prevChannelId.current !== track.channel.id) {
          const prevChannel = audioEditorManager.channels.get(
            prevChannelId.current,
          );

          if (prevChannel) {
            prevChannel.removeTrack(track);
          }

          track.channel.addTrack(track);
        }

        adjustTracksOnPaste(track);
      }
    },
    [audioEditorManager.channels, calcNewStartTime, track],
  );

  useEffect(() => {
    if (!trackRef.current) {
      return;
    }

    trackRef.current.dataset.channelUuid = track.channel.id;
    trackRef.current.dataset.trackUuid = track.uuid;
  }, [track.channel.id, track.uuid]);

  useEffect(() => {
    const updateTrack = () =>
      updateTrackPosition(
        timelineController.scroll,
        timelineController.timelineContainer.pixelsPerSecond,
        timelineController.boundingClientRect.right -
          timelineController.boundingClientRect.x,
      );

    const animationId = requestAnimationFrame(updateTrack);

    return () => cancelAnimationFrame(animationId);
  }, [
    timelineController.timelineContainer.pixelsPerSecond,
    timelineController.scroll,
    updateTrackPosition,
    timelineController.boundingClientRect.right,
    timelineController.boundingClientRect.x,
  ]);

  const handleSnapLeft = useCallback(() => {
    const tracks = values(audioEditorManager.channels)
      .flatMap((channel) => channel.tracks)
      .filter(
        (channelTrack) =>
          channelTrack.uuid !== track.uuid &&
          channelTrack.trimEndTime <= track.trimStartTime,
      )
      .sort((a, b) => a.trimEndTime - b.trimEndTime);

    const foundTrack = tracks.at(-1);

    track.setStartTime(foundTrack?.trimEndTime ?? 0);
  }, [audioEditorManager.channels, track]);

  const handleSnapRight = useCallback(() => {
    const tracks = values(audioEditorManager.channels)
      .flatMap((channel) => channel.tracks)
      .filter(
        (channelTrack) =>
          channelTrack.uuid !== track.uuid &&
          channelTrack.trimStartTime >= track.trimEndTime,
      )
      .sort((a, b) => a.trimStartTime - b.trimStartTime);

    const foundTrack = tracks[0];

    if (!foundTrack) {
      return;
    }

    track.setStartTime(foundTrack.trimStartTime - track.trimDuration);
  }, [audioEditorManager.channels, track]);

  return (
    <TrackCardMemoized
      className={cn('absolute z-0', className)}
      ref={trackRef}
      color={track.color ?? undefined}
      track={track.meta}
      isSolo={track.channel?.isSolo}
      isSelected={isSelected}
      onClick={handleClick}
      editPopoverContent={
        <TrackEditMenu
          onSnapLeft={handleSnapLeft}
          onSnapRight={handleSnapRight}
        />
      }
      // Drag logic
      draggable={!disableInteractive}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // Prevent events
      onDragEnter={preventAll}
      onDragLeave={preventAll}
      onDragOver={preventAll}
      onDrop={preventAll}
      {...props}
    />
  );
});
