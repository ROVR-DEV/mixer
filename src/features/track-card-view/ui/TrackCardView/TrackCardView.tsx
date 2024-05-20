import { clamp } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useAudioEditorTimelineState } from '@/entities/audio-editor';
import {
  TrackCardMemoized,
  WaveformMemoized,
  waveformOptions,
} from '@/entities/track';

import { TrackCardViewProps } from './interfaces';

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
  const trackWidth = trackEndXGlobal - trackStartXGlobal;

  return { trackStartXGlobal, trackEndXGlobal, trackWidth };
};

export const TrackCardView = observer(function TrackCardView({
  track,
  channel,
  onTrackSelect,
  trackData,
  isSelected,
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

  // const trackBounds = useMemo(() => {
  //   const tracks = [...channel.tracks];

  //   let leftBound = 0;
  //   let rightBound = Infinity;
  //   for (let i = 0; i < tracks.length; i++) {
  //     leftBound = i === 0 ? 0 : tracks[i - 1].data.end;
  //     rightBound =
  //       i + 1 === tracks.length ? Infinity : tracks[i + 1].currentStartTime;

  //     if (tracks[i].data.uuid === track.data.uuid) {
  //       break;
  //     }
  //   }

  //   return { leftBound, rightBound };
  // }, [channel.tracks, track.data.uuid]);

  const handleClick = useCallback(() => {
    onTrackSelect(track);
  }, [onTrackSelect, track]);

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

      trackRef.current.dataset.channelUuid = track.channelId;
      trackRef.current.dataset.trackUuid = track.data.uuid;

      trackRef.current.style.display = isVisible ? '' : 'none';
      trackRef.current.style.width = `${trackWidth}px`;
      trackRef.current.style.left = `${shiftFromLeft}px`;
    },
    [
      globalToLocalCoordinates,
      track.channelId,
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
      onTrackSelect(track, true);
      removeDragGhostImage(e);

      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.effectAllowed = 'move';

      e.currentTarget.style.cursor = 'pointer';

      e.dataTransfer.setData('text/trackId', track.data.uuid);
      e.dataTransfer.setData('text/channelId', track.channelId);

      e.currentTarget.dataset.startX = `${e.nativeEvent.pageX}`;
      e.currentTarget.dataset.startY = `${e.nativeEvent.pageY}`;
      e.currentTarget.dataset.startTime = `${track.currentStartTime}`;
      e.currentTarget.dataset.leftBound = `${0}`;
      e.currentTarget.dataset.rightBound = `${Infinity}`;

      e.currentTarget.style.zIndex = '10';
    },
    [onTrackSelect, track],
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
      const currentChannelIndex = Math.floor(
        (Number(e.currentTarget.dataset.startY) - 222) / 96,
      );

      const channelIndex = globalChannelIndex - currentChannelIndex;

      if (channelIndex >= 0 && channelIndex <= 1) {
        trackRef.current.style.top = channelIndex * 96 + 6 + 'px';
      }
    },
    [calcNewStartTime, track],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!trackRef.current) {
        return;
      }

      const startTime = calcNewStartTime(e);
      track.setNewStartTime(startTime);

      const trackDuration = track.currentEndTime - track.currentStartTime;
      const endTime = startTime + trackDuration;

      channel.tracks.forEach((tr) => {
        if (startTime > tr.currentStartTime && startTime < tr.currentEndTime) {
          tr.setEndTime(startTime);
        }

        if (endTime > tr.currentStartTime && endTime < tr.currentEndTime) {
          tr.setStartTime(endTime);
        }
      });

      e.currentTarget.style.cursor = '';
      e.currentTarget.style.zIndex = '';
    },
    [calcNewStartTime, channel.tracks, track],
  );

  useEffect(() => {
    updateTrackPosition(
      audioEditorTimelineState.scroll,
      audioEditorTimelineState.pixelsPerSecond,
      audioEditorTimelineState.timelineLeftPadding,
      audioEditorTimelineState.endPageX - audioEditorTimelineState.startPageX,
    );
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
      className='absolute'
      track={track.data}
      ref={trackRef}
      draggable
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      isSolo={channel?.isSolo}
      isSelected={isSelected}
      waveformComponent={waveformComponent}
      onClick={handleClick}
      {...props}
    />
  );
});
