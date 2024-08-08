'use client';

import { throttle } from 'lodash-es';
import { useCallback, useMemo, useRef, useState } from 'react';

import { clamp, preventAll } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';
import { TrimSide } from '@/shared/ui';

// eslint-disable-next-line boundaries/element-types
import { Timeline, useAudioEditor } from '@/entities/audio-editor';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { MIN_TRACK_DURATION } from '../config';
import { AudioEditorTrack, Side } from '../model';

import { getTrimMarkerAriaAttributes } from './trimMarkerAria';

export interface UseTrimMarkerProps {
  trimSide: TrimSide;
  track: AudioEditorTrack | null;
  timeline: Timeline;
}

const setTrim = throttle(
  (
    e: MouseEvent,
    track: AudioEditorTrack | null,
    side: Side,
    timeline: Timeline,
    bounds: { left: number; right: number },
  ) => {
    if (!track) {
      return;
    }

    const time = clamp(
      timeline.virtualPixelsToTime(e.pageX),
      Math.max(0, track.startTime, bounds.left),
      Math.min(track.endTime, bounds.right),
    );

    if (side === 'left') {
      const leftTime = clamp(
        time,
        -Infinity,
        track.trimEndTime - MIN_TRACK_DURATION,
      );

      track.setStartTrimDuration(leftTime - track.startTime);
    } else if (side === 'right') {
      const rightTime = clamp(
        time,
        track.trimStartTime + MIN_TRACK_DURATION,
        Infinity,
      );

      track.setEndTrimDuration(track.endTime - rightTime);
    }
  },
  3,
);

export const useTrimMarker = ({
  track,
  timeline,
  trimSide,
}: UseTrimMarkerProps) => {
  const audioEditor = useAudioEditor();

  const trimMarkerRef = useRef<HTMLDivElement | null>(null);

  const ariaAttributes = useMemo(
    () =>
      getTrimMarkerAriaAttributes(
        track?.duration ?? 0,
        trimSide,
        track?.startTrimDuration ?? 0,
        track?.endTrimDuration ?? 0,
      ),
    [
      trimSide,
      track?.duration,
      track?.endTrimDuration,
      track?.startTrimDuration,
    ],
  );

  const [bounds, setBounds] = useState<{ left: number; right: number }>({
    left: 0,
    right: Infinity,
  });

  const handleDragStart = useCallback(
    (_: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (!trimMarkerRef.current) {
        return;
      }

      if (!track) {
        return;
      }

      if (!track.isTrimming) {
        track.isTrimming = true;
      }

      const leftTrack = track.channel.tracks.findLast(
        (channelTrack) => channelTrack.trimEndTime <= track.trimStartTime,
      );
      const rightTrack = track.channel.tracks.find(
        (channelTrack) => channelTrack.trimStartTime >= track.trimEndTime,
      );

      setBounds({
        left: leftTrack?.trimEndTime ?? 0,
        right: rightTrack?.trimStartTime ?? Infinity,
      });
    },
    [track],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!trimMarkerRef.current) {
        return;
      }

      setTrim(e, track, trimSide, timeline, bounds);
    },
    [bounds, trimSide, timeline, track],
  );

  const handleMouseUp = useCallback(() => {
    if (!trimMarkerRef.current) {
      return;
    }

    if (!track) {
      return;
    }

    if (track.isTrimming) {
      track.isTrimming = false;
      adjustTracksOnPaste(track);
      audioEditor.saveState();
    }
  }, [audioEditor, track]);

  const { onMouseDown } = useGlobalDnD({
    onDragStart: handleDragStart,
    onDrag: handleMouseMove,
    onDragEnd: handleMouseUp,
  });

  return {
    ref: trimMarkerRef,
    onClick: preventAll,
    onMouseDown: onMouseDown,
    onMouseUp: handleMouseUp,
    ...ariaAttributes,
  };
};
