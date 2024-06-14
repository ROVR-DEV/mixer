'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { clamp, preventAll, removeDragGhostImage } from '@/shared/lib';

import {
  TimelineController,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, TrackWithMeta } from '../model';

export interface UseFadeMarkerProps {
  side: FadeSide;
  track: TrackWithMeta | null;
  timelineController: TimelineController;
}

export const useFadeMarker = ({
  side,
  track,
  timelineController,
}: UseFadeMarkerProps): {
  position: number;
  fadeMarkerProps: React.ComponentPropsWithoutRef<'div'>;
} => {
  const ariaAttributes = useMemo(() => {
    return {
      role: 'slider',
      'aria-label': `Fade ${side === 'left' ? 'in' : 'out'}`,
      'aria-valuemax': track?.duration,
      'aria-valuenow': 0,
      'aria-valuetext': `Fade ${side === 'left' ? 'in' : 'out'} for ${0} seconds}`,
    };
  }, [side, track?.duration]);

  const timeToPosition = useCallback(
    (time: number) => {
      return (
        timelineController.realToVirtualPixels(time) +
        timelineController.timelineLeftPadding
      );
    },
    [timelineController],
  );

  const getMarkerStartTime = useCallback(
    () =>
      side === 'left'
        ? track?.trackAudioFilters?.fadeInNode.endTime ?? 0
        : track?.trackAudioFilters?.fadeOutNode.startTime ?? 0,
    [
      side,
      track?.trackAudioFilters?.fadeInNode.endTime,
      track?.trackAudioFilters?.fadeOutNode.startTime,
    ],
  );

  const [position, setPosition] = useState(
    timeToPosition(getMarkerStartTime()),
  );

  const setAriaAttributes = useCallback(
    (target: HTMLElement, time: number) => {
      const currentTime =
        side === 'left' ? time : (track?.duration ?? 0) - time;

      target.setAttribute('aria-valuenow', currentTime.toString());
      target.setAttribute(
        'aria-valuetext',
        `Fade ${side === 'left' ? 'in' : 'out'} for ${currentTime} seconds}`,
      );
    },
    [side, track?.duration],
  );

  const updatePosition = useCallback(() => {
    setPosition(timeToPosition(getMarkerStartTime()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, timeToPosition]);

  const getBounds = useCallback(() => {
    if (!track?.trackAudioFilters) {
      return { leftBound: 0, rightBound: 0 };
    }

    const leftBound =
      side === 'left'
        ? 0
        : Math.max(
            track?.currentStartTime,
            track?.trackAudioFilters?.fadeInNode.endTime +
              track?.currentStartTime,
          );

    const rightBound =
      side === 'right'
        ? track?.currentEndTime
        : Math.min(
            track?.currentEndTime,
            track?.trackAudioFilters.fadeOutNode.startTime +
              track?.currentStartTime,
          );

    return { leftBound, rightBound };
  }, [side, track]);

  const getNewTime = useCallback(
    (pageX: number) => {
      if (!track?.trackAudioFilters) {
        throw new Error('Editable track not found');
      }

      const { leftBound, rightBound } = getBounds();

      const time = timelineController.realLocalPixelsToGlobal(
        timelineController.virtualToRealPixels(
          pageX - timelineController.startPageX,
        ),
      );

      return clamp(time, leftBound, rightBound);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [track, timelineController],
  );

  const setFadeTime = useCallback(
    (time: number) => {
      if (!track?.trackAudioFilters) {
        throw new Error('Editable track not found');
      }

      if (side === 'left') {
        track?.trackAudioFilters.fadeInNode.linearFadeIn(0, time);
      } else if (side === 'right') {
        track?.trackAudioFilters.fadeOutNode.linearFadeOut(
          time,
          track?.duration - time,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!track?.trackAudioFilters) {
        return;
      }

      const time = getNewTime(e.pageX);

      const trackRelativeTime = time - track?.currentStartTime;

      setFadeTime(trackRelativeTime);
      setAriaAttributes(e.currentTarget, time);

      requestAnimationFrame(() => {
        setPosition(timeToPosition(trackRelativeTime));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getNewTime, side],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      removeDragGhostImage(e);
      handleDrag(e);
    },
    [handleDrag],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      handleDrag(e);
    },
    [handleDrag],
  );

  useEffect(() => {
    updatePosition();
  }, [
    track?.trackAudioFilters?.fadeInNode.endTime,
    track?.trackAudioFilters?.fadeOutNode.startTime,
    updatePosition,
  ]);

  useEffect(() => {
    timelineController.zoomController.addListener(updatePosition);

    return () =>
      timelineController.zoomController.removeListener(updatePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineController, side, updatePosition]);

  return {
    position,
    fadeMarkerProps: {
      draggable: true,
      onDrag: handleDrag,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: preventAll,
      onDrop: preventAll,
      ...ariaAttributes,
    },
  };
};
