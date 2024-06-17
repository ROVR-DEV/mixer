'use client';

import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import { clamp, preventAll } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { TimelineController } from '@/entities/audio-editor';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { TrackWithMeta, TrimSide } from '../model';

export interface UseTrimMarkerProps {
  side: TrimSide;
  track: TrackWithMeta | null;
  timelineController: TimelineController;
  markerRef: RefObject<HTMLDivElement | null>;
}

export const useTrimMarker = ({
  side,
  track,
  timelineController,
  markerRef,
}: UseTrimMarkerProps) => {
  const draggingElement = useRef<EventTarget | null>(null);

  const ariaAttributes = useMemo(() => {
    return {
      role: 'slider',
      'aria-label': `Fade ${side === 'left' ? 'in' : 'out'}`,
      'aria-valuemax': track?.duration,
      'aria-valuenow': 0,
      'aria-valuetext': `Fade ${side === 'left' ? 'in' : 'out'} for ${0} seconds}`,
    };
  }, [side, track?.duration]);

  // const setAriaAttributes = useCallback(
  //   (target: HTMLElement, time: number) => {
  //     const currentTime =
  //       side === 'left' ? time : (track?.duration ?? 0) - time;

  //     target.setAttribute('aria-valuenow', currentTime.toString());
  //     target.setAttribute(
  //       'aria-valuetext',
  //       `Fade ${side === 'left' ? 'in' : 'out'} for ${currentTime} seconds}`,
  //     );
  //   },
  //   [side, track?.duration],
  // );

  const getBounds = useCallback(() => {
    return {
      leftBound: track?.startTime,
      rightBound: track?.endTime,
    };
  }, [track]);

  const getNewTime = useCallback(
    (pageX: number) => {
      const { leftBound, rightBound } = getBounds();

      const time = timelineController.realLocalPixelsToGlobal(
        timelineController.virtualToRealPixels(
          pageX - timelineController.startPageX,
        ),
      );

      return clamp(time, leftBound, rightBound);
    },
    [getBounds, timelineController],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const time = getNewTime(e.pageX);

      if (side === 'left') {
        track?.setStartTime(time);
      } else if (side === 'right') {
        track?.setEndTime(time);
      }

      // setAriaAttributes(e.currentTarget, time);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getNewTime, side],
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    preventAll(e);
    draggingElement.current = e.target;
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);
      draggingElement.current = null;
      if (track) {
        adjustTracksOnPaste(track);
      }
    },
    [track],
  );

  useEffect(() => {
    if (!markerRef.current) {
      return;
    }

    const mouseMove = (e: MouseEvent) => {
      if (!draggingElement.current) {
        return;
      }

      handleMouseMove(e);
    };

    const mouseUp = () => {
      draggingElement.current = null;
      if (track) {
        adjustTracksOnPaste(track);
      }
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [handleMouseMove, markerRef, track]);

  return {
    onClick: preventAll,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onDrag: preventAll,
    onDragStart: preventAll,
    onDragEnd: preventAll,
    ...ariaAttributes,
  };
};
