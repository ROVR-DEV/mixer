'use client';

import { clamp } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { useAudioEditorTimelineState } from '@/entities/audio-editor';
import {
  TrackCardMemoized,
  TrackWithMeta,
  WaveformMemoized,
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
  trackData,
  ...props
}: TrackCardViewProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const audioEditorTimelineState = useAudioEditorTimelineState();

  const isSelected = useMemo(
    () => audioEditorManager.selectedTrack?.uuid === track.uuid,
    [audioEditorManager.selectedTrack?.uuid, track.uuid],
  );

  const waveformComponent = useMemo(
    () => (
      <WaveformMemoized
        data={trackData}
        color={isSelected ? 'primary' : 'secondary'}
        options={
          track.audioBufferPeaks
            ? { ...waveformOptions, peaks: track.audioBufferPeaks }
            : waveformOptions
        }
        onMount={(wavesurfer) => {
          track.setAudioBuffer(wavesurfer);
          wavesurfer.once('ready', () => {
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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      selectTrack();
    },
    [selectTrack],
  );

  const { trackWidth, trackStartXGlobal, trackEndXGlobal } = useMemo(
    () =>
      getTrackCoordinates(
        track.currentStartTime,
        track.currentEndTime,
        audioEditorTimelineState.pixelsPerSecond,
      ),
    [
      track.currentStartTime,
      track.currentEndTime,
      audioEditorTimelineState.pixelsPerSecond,
    ],
  );

  const globalToLocalCoordinates = useCallback(
    (globalX: number) => {
      const virtualScrollOffsetX =
        audioEditorTimelineState.scroll *
        audioEditorTimelineState.pixelsPerSecond;
      return globalX - virtualScrollOffsetX;
    },
    [audioEditorTimelineState.pixelsPerSecond, audioEditorTimelineState.scroll],
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
    (
      scroll: number,
      pixelsPerSecond: number,
      timelineLeftPadding: number,
      timelineClientWidth: number,
    ) => {
      updateTrackWidth();
      updateTrackShiftFromLeft(timelineLeftPadding);
      updateTrackVisibility(scroll, pixelsPerSecond, timelineClientWidth);
    },
    [updateTrackShiftFromLeft, updateTrackVisibility, updateTrackWidth],
  );

  const calcNewStartTime = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const leftTimeBound = Number(e.currentTarget.dataset.leftBound);
      const rightTimeBound = Infinity;

      const startTime = Number(e.currentTarget.dataset.startTime);

      const startX = Number(e.currentTarget.dataset.startX);
      const timeOffset =
        (e.pageX - startX) / audioEditorTimelineState.pixelsPerSecond;

      return clamp(startTime + timeOffset, leftTimeBound, rightTimeBound);
    },
    [audioEditorTimelineState.pixelsPerSecond],
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
        audioEditorTimelineState.scroll,
        audioEditorTimelineState.pixelsPerSecond,
        audioEditorTimelineState.timelineLeftPadding,
        audioEditorTimelineState.endPageX - audioEditorTimelineState.startPageX,
      );

    const animationId = requestAnimationFrame(updateTrack);

    return () => cancelAnimationFrame(animationId);
  }, [
    audioEditorTimelineState.endPageX,
    audioEditorTimelineState.pixelsPerSecond,
    audioEditorTimelineState.scroll,
    audioEditorTimelineState.startPageX,
    audioEditorTimelineState.timelineLeftPadding,
    updateTrackPosition,
  ]);

  return (
    <TrackCardMemoized
      className='absolute z-0'
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
