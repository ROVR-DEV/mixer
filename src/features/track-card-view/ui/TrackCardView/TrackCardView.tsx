'use client';

import { observer } from 'mobx-react-lite';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { clamp, cn } from '@/shared/lib';

import {
  TIMELINE_LEFT_PADDING,
  useTimelineController,
} from '@/entities/audio-editor';
import {
  TrackCardMemoized,
  TrackWithMeta,
  WaveformMemoized,
  useTracksManager,
  waveformOptions,
} from '@/entities/track';

import {
  clearDragProperties,
  getTrackCoordinates,
  setDragProperties,
  setDragSettings,
} from '../../lib';

import { TrackCardViewProps } from './interfaces';
import styles from './styles.module.css';

export const TrackCardView = observer(function TrackCardView({
  track,
  audioEditorManager,
  ignoreSelection,
  className,
  ...props
}: TrackCardViewProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const tracksManager = useTracksManager();
  const trackData = useMemo(
    () => tracksManager.tracksData.get(track.data.uuid),
    [track.data.uuid, tracksManager.tracksData],
  );

  const timelineController = useTimelineController();

  const isSelected = useMemo(
    () =>
      ignoreSelection
        ? false
        : audioEditorManager.selectedTrack?.uuid === track.uuid,
    [audioEditorManager.selectedTrack?.uuid, ignoreSelection, track.uuid],
  );

  const waveformComponent = useMemo(
    () => (
      <WaveformMemoized
        data={trackData?.blob}
        color={isSelected ? 'primary' : 'secondary'}
        peaks={track.audioBufferPeaks ?? undefined}
        duration={track.duration}
        options={{ ...waveformOptions, media: track.media ?? undefined }}
        onMount={(wavesurfer) => {
          track.setAudioBuffer(wavesurfer);
          wavesurfer.once('ready', () => {
            track.setMedia(wavesurfer.getMediaElement());
            track.setAudioBufferPeaks(wavesurfer.exportPeaks());
          });
        }}
      />
    ),
    [isSelected, track, trackData],
  );

  const selectTrack = useCallback(() => {
    audioEditorManager.setSelectedTrack(track);
  }, [audioEditorManager, track]);

  const handleEdit = useCallback(() => {
    audioEditorManager.setEditableTrack(track);
  }, [audioEditorManager, track]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      selectTrack();

      if (e.detail === 2) {
        handleEdit();
      }
    },
    [handleEdit, selectTrack],
  );

  const { trackWidth, trackStartXGlobal, trackEndXGlobal } = useMemo(
    () =>
      getTrackCoordinates(
        track.currentStartTime,
        track.currentEndTime,
        timelineController.timelineContainer.pixelsPerSecond,
      ),
    [
      track.currentStartTime,
      track.currentEndTime,
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
      selectTrack();
      setDragSettings(e);

      e.dataTransfer.setData('text/trackId', track.uuid);
      e.dataTransfer.setData('text/channelId', track.channel.id);

      prevChannelId.current = track.channel.id;

      setDragProperties(e, track.currentStartTime);
    },
    [selectTrack, track.channel.id, track.currentStartTime, track.uuid],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const grid = (e.target as HTMLElement).parentElement?.parentElement
        ?.parentElement;

      const startTime = calcNewStartTime(e);

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
          track.setChannel(currentChannel);
        }

        const channelOffset = globalChannelIndex - currentChannelIndex;

        e.currentTarget.style.top = channelOffset * 96 + 6 + 'px';
      }

      if (track.currentStartTime === startTime) {
        return;
      }

      track.setNewStartTime(startTime);

      if (track.audioBuffer?.isPlaying()) {
        track.audioBuffer?.pause();
      }
    },
    [
      audioEditorManager.channelIds,
      audioEditorManager.channels,
      calcNewStartTime,
      track,
    ],
  );

  const adjustTracksOnPaste = useCallback((track: TrackWithMeta) => {
    track.channel.tracks.forEach((trackOnLine) => {
      if (track.uuid === trackOnLine.uuid) {
        return;
      }

      const trackIntersectsFull =
        track.currentStartTime <= trackOnLine.currentStartTime &&
        track.currentEndTime >= trackOnLine.currentEndTime;

      if (trackIntersectsFull) {
        track.channel.removeTrack(trackOnLine);
        return;
      }

      const trackIntersectsOnStart =
        track.currentEndTime > trackOnLine.currentStartTime &&
        track.currentEndTime < trackOnLine.currentEndTime;

      const trackIntersectsOnEnd =
        track.currentStartTime > trackOnLine.currentStartTime &&
        track.currentStartTime < trackOnLine.currentEndTime;

      if (trackIntersectsOnStart && trackIntersectsOnEnd) {
        const trackOnLineCopy = new TrackWithMeta(
          trackOnLine.data,
          trackOnLine.channel,
        );
        if (trackOnLine.audioBufferPeaks) {
          trackOnLineCopy.setAudioBufferPeaks(trackOnLine.audioBufferPeaks);
        }
        trackOnLineCopy.setNewStartTime(trackOnLine.currentStartTime);
        trackOnLineCopy.setStartTime(track.currentEndTime);
        trackOnLineCopy.setEndTime(trackOnLine.currentEndTime);

        trackOnLine.setEndTime(track.currentStartTime);

        track.channel.addTrack(trackOnLineCopy);
      } else if (trackIntersectsOnStart) {
        trackOnLine.setStartTime(track.currentEndTime);
      } else if (trackIntersectsOnEnd) {
        trackOnLine.setEndTime(track.currentStartTime);
      }
    });
  }, []);

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      track.setNewStartTime(calcNewStartTime(e));
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
    [adjustTracksOnPaste, audioEditorManager.channels, calcNewStartTime, track],
  );

  const onDragDropPrevent = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    },
    [],
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
        timelineController.endPageX - timelineController.startPageX,
      );

    const animationId = requestAnimationFrame(updateTrack);

    return () => cancelAnimationFrame(animationId);
  }, [
    timelineController.endPageX,
    timelineController.timelineContainer.pixelsPerSecond,
    timelineController.scroll,
    timelineController.startPageX,
    updateTrackPosition,
  ]);

  return (
    <TrackCardMemoized
      className={cn('absolute z-0', className)}
      ref={trackRef}
      track={track.data}
      isSolo={track.channel?.isSolo}
      isSelected={isSelected}
      waveformComponent={waveformComponent}
      onClick={handleClick}
      // Drag logic
      draggable
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // Prevent events
      onDragOver={onDragDropPrevent}
      onDrop={onDragDropPrevent}
      {...props}
    />
  );
});

export const TrackCardViewMemoized = memo(TrackCardView);
