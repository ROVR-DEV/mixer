'use client';

import { useCallback, useMemo, useRef } from 'react';

// eslint-disable-next-line boundaries/element-types
import { clamp, preventAll } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

// eslint-disable-next-line boundaries/element-types
import { TimelineController } from '@/entities/audio-editor';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { AudioEditorTrack, TrimSide } from '../model';

import { getTrimMarkerAriaAttributes } from './trimMarkerAria';

export interface UseTrimMarkerProps {
  side: TrimSide;
  track: AudioEditorTrack | null;
  timelineController: TimelineController;
}

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

  const updateTrim = useCallback(
    (e: MouseEvent) => {
      if (!track) {
        return;
      }

      requestAnimationFrame(() => {
        const time = clamp(
          timelineController.virtualPixelsToTime(e.pageX),
          Math.max(track.startTime, 0),
          track.endTime,
        );

        if (side === 'left') {
          track.setStartTrimDuration(time - track.startTime);
        } else if (side === 'right') {
          track.setEndTrimDuration(track.endTime - time);
        }
      });
    },
    [side, timelineController, track],
  );

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
    },
    [track],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!trimMarkerRef.current) {
        return;
      }

      updateTrim(e);
    },
    [updateTrim],
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
