'use client';

import { throttle } from 'lodash-es';
import { useCallback, useMemo, useRef, useState } from 'react';

// eslint-disable-next-line boundaries/element-types
import { clamp, preventAll } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

// eslint-disable-next-line boundaries/element-types
import { TimelineController } from '@/entities/audio-editor';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { AudioEditorTrack, Side, TrimSide } from '../model';

import { getTrimMarkerAriaAttributes } from './trimMarkerAria';

export interface UseTrimMarkerProps {
  side: TrimSide;
  track: AudioEditorTrack | null;
  timelineController: TimelineController;
}

const updateTrim = throttle(
  (
    e: MouseEvent,
    track: AudioEditorTrack | null,
    side: Side,
    timelineController: TimelineController,
    bounds: { left: number; right: number },
  ) => {
    if (!track) {
      return;
    }

    const time = clamp(
      timelineController.virtualPixelsToTime(e.pageX),
      Math.max(0, track.startTime, bounds.left),
      Math.min(track.endTime, bounds.right),
    );

    if (side === 'left') {
      track.setStartTrimDuration(time - track.startTime);
    } else if (side === 'right') {
      track.setEndTrimDuration(track.endTime - time);
    }
  },
  1.5,
);

export const useTrimMarker = ({
  side,
  track,
  timelineController,
}: UseTrimMarkerProps) => {
  const trimMarkerRef = useRef<HTMLDivElement | null>(null);

  const ariaAttributes = useMemo(
    () =>
      getTrimMarkerAriaAttributes(
        track?.duration ?? 0,
        side,
        track?.startTrimDuration ?? 0,
        track?.endTrimDuration ?? 0,
      ),
    [side, track?.duration, track?.endTrimDuration, track?.startTrimDuration],
  );

  const [bounds, setBounds] = useState<{ left: number; right: number }>({
    left: 0,
    right: Infinity,
  });

  const handleDragStart = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (!trimMarkerRef.current) {
        return;
      }

      if (!track) {
        return;
      }

      if (e.target !== trimMarkerRef.current) {
        return;
      }

      if (!track.isTrimming) {
        track.isTrimming = true;
      }

      const leftTrack = track.channel.tracks.findLast(
        (channelTrack) => channelTrack.trimEndTime < track.trimStartTime,
      );
      const rightTrack = track.channel.tracks.find(
        (channelTrack) => channelTrack.trimStartTime > track.trimEndTime,
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

      updateTrim(e, track, side, timelineController, bounds);
    },
    [bounds, side, timelineController, track],
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
    }
  }, [track]);

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
    onDrag: preventAll,
    onDragStart: preventAll,
    onDragEnd: preventAll,
    ...ariaAttributes,
  };
};
