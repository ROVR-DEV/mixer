'use client';

import { clamp, round } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useAudioEditorTimelineState } from '@/entities/audio-editor';
import {
  TrackCardMemoized,
  WaveformMemoized,
  waveformOptions,
} from '@/entities/track';

import { TrackCardViewProps } from './interfaces';
import styles from './styles.module.css';

const removeDragGhostImage = (e: React.DragEvent) => {
  const canvas = document.createElement('canvas');
  e.dataTransfer.setDragImage(canvas, 0, 0);
  canvas.remove();
};

const getTrackCoordinates = (
  startTime: number,
  endTime: number,
  pixelsPerSecond: number,
) => {
  const trackStartXGlobal = startTime * pixelsPerSecond;
  const trackEndXGlobal = endTime * pixelsPerSecond;
  const trackWidth = round(trackEndXGlobal - trackStartXGlobal, 3);

  return { trackStartXGlobal, trackEndXGlobal, trackWidth };
};

export const TrackCardView = observer(function TrackCardView({
  track,
  audioEditorManager,
  trackData,
  ...props
}: TrackCardViewProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const audioEditorTimelineState = useAudioEditorTimelineState();

  const onMount = useCallback(
    (wavesurfer: WaveSurfer) => {
      track.audioBuffer = wavesurfer;
    },
    [track],
  );

  const isSelected = useMemo(
    () => audioEditorManager.selectedTrack?.data.uuid === track.data.uuid,
    [audioEditorManager.selectedTrack?.data.uuid, track.data.uuid],
  );

  const waveformComponent = useMemo(
    () => (
      <WaveformMemoized
        data={trackData}
        color={isSelected ? 'primary' : 'secondary'}
        options={waveformOptions}
        onMount={onMount}
      />
    ),
    [isSelected, onMount, trackData],
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

  const updateTrackPosition = useCallback(
    (
      scroll: number,
      pixelsPerSecond: number,
      timelineLeftPadding: number,
      timelineClientWidth: number,
    ) => {
      if (!trackRef.current) {
        return;
      }

      const virtualScrollOffsetX = scroll * pixelsPerSecond;

      const shiftFromLeft = globalToLocalCoordinates(
        trackStartXGlobal + timelineLeftPadding,
      );

      const bufferViewWidth = 400;

      const isVisible =
        trackStartXGlobal <
          timelineClientWidth + virtualScrollOffsetX + bufferViewWidth &&
        trackEndXGlobal > virtualScrollOffsetX - bufferViewWidth;

      trackRef.current.dataset.channelUuid = track.channel.id;
      trackRef.current.dataset.trackUuid = track.data.uuid;

      // trackRef.current.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        trackRef.current.classList.remove(styles.hiddenTrack);
      } else {
        trackRef.current.classList.add(styles.hiddenTrack);
      }
      trackRef.current.style.width = `${trackWidth}px`;
      trackRef.current.style.left = `${shiftFromLeft}px`;
    },
    [
      globalToLocalCoordinates,
      track.channel.id,
      track.data.uuid,
      trackEndXGlobal,
      trackStartXGlobal,
      trackWidth,
    ],
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

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      selectTrack();

      removeDragGhostImage(e);

      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.effectAllowed = 'move';

      e.currentTarget.style.cursor = 'pointer';

      e.dataTransfer.setData('text/trackId', track.data.uuid);
      e.dataTransfer.setData('text/channelId', track.channel.id);

      e.currentTarget.dataset.startX = `${e.nativeEvent.pageX}`;
      e.currentTarget.dataset.startY = `${e.nativeEvent.pageY}`;
      e.currentTarget.dataset.startTime = `${track.currentStartTime}`;
      e.currentTarget.dataset.leftBound = `${0}`;
      e.currentTarget.dataset.rightBound = `${Infinity}`;

      e.currentTarget.style.zIndex = '10';
    },
    [selectTrack, track.channel.id, track.currentStartTime, track.data.uuid],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!trackRef.current) {
        return;
      }

      if (track.audioBuffer?.isPlaying()) {
        track.audioBuffer?.pause();
      }

      const startTime = calcNewStartTime(e);
      track.setNewStartTime(startTime);

      const globalChannelIndex = Math.floor((Number(e.pageY) - 222) / 96);
      if (
        globalChannelIndex >= 0 &&
        globalChannelIndex < audioEditorManager.channels.size
      ) {
        const currentChannel = Math.floor(
          Math.floor(Number(e.currentTarget.dataset.startY) - 222) / 96,
        );

        const channelOffset = globalChannelIndex - currentChannel;

        trackRef.current.style.top = channelOffset * 96 + 6 + 'px';
      }
    },
    [audioEditorManager.channels.size, calcNewStartTime, track],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!trackRef.current) {
        return;
      }

      track.setNewStartTime(calcNewStartTime(e));

      e.currentTarget.dataset.startX = '';
      e.currentTarget.dataset.startY = '';
      e.currentTarget.dataset.startTime = '';
      e.currentTarget.dataset.leftBound = '';
      e.currentTarget.dataset.rightBound = '';
      e.currentTarget.style.cursor = '';
      e.currentTarget.style.zIndex = '';
    },
    [calcNewStartTime, track],
  );

  useEffect(() => {
    const animationId = requestAnimationFrame(() =>
      updateTrackPosition(
        audioEditorTimelineState.scroll,
        audioEditorTimelineState.pixelsPerSecond,
        audioEditorTimelineState.timelineLeftPadding,
        audioEditorTimelineState.endPageX - audioEditorTimelineState.startPageX,
      ),
    );

    return () => cancelAnimationFrame(animationId);
  }, [
    audioEditorTimelineState.endPageX,
    audioEditorTimelineState.pixelsPerSecond,
    audioEditorTimelineState.scroll,
    audioEditorTimelineState.startPageX,
    audioEditorTimelineState.timelineLeftPadding,
    updateTrackPosition,
  ]);

  const onDragOver = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <TrackCardMemoized
      className='absolute'
      ref={trackRef}
      track={track.data}
      isSolo={track.channel?.isSolo}
      isSelected={isSelected}
      waveformComponent={waveformComponent}
      onClick={handleClick}
      // Drag logic
      draggable
      onDragOver={onDragOver}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...props}
    />
  );
});

export const TrackCardViewMemoized = memo(TrackCardView);
