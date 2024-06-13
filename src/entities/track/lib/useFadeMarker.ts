'use client';

import { useCallback, useEffect, useState } from 'react';

import { clamp, preventAll, removeDragGhostImage } from '@/shared/lib';

import {
  AudioEditorManager,
  TimelineController,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide } from '../model';

export interface UseFadeMarkerProps {
  side: FadeSide;
  audioEditorManager: AudioEditorManager;
  timelineController: TimelineController;
}

export const useFadeMarker = ({
  side,
  audioEditorManager,
  timelineController,
}: UseFadeMarkerProps): {
  position: number;
  fadeMarkerProps: React.ComponentPropsWithoutRef<'div'>;
} => {
  const timeToPosition = useCallback(
    (time: number) => {
      return (
        timelineController.realToVirtualPixels(time) +
        timelineController.timelineLeftPadding
      );
    },
    [timelineController],
  );

  const [position, setPosition] = useState(
    timeToPosition(
      side === 'left'
        ? audioEditorManager.editableTrack?.trackAudioFilters?.fadeInNode
            .endTime ?? 0
        : audioEditorManager.editableTrack?.trackAudioFilters?.fadeOutNode
            .startTime ?? 0,
    ),
  );

  const getNewTime = useCallback(
    (pageX: number) => {
      if (!audioEditorManager.editableTrack?.trackAudioFilters) {
        throw new Error('Editable track not found');
      }

      const leftBound =
        side === 'left'
          ? 0
          : Math.max(
              audioEditorManager.editableTrack.currentStartTime,
              audioEditorManager.editableTrack.trackAudioFilters?.fadeInNode
                .endTime + audioEditorManager.editableTrack.currentStartTime,
            );

      const rightBound =
        side === 'right'
          ? audioEditorManager.editableTrack.currentEndTime
          : Math.min(
              audioEditorManager.editableTrack.currentEndTime,
              audioEditorManager.editableTrack.trackAudioFilters.fadeOutNode
                .startTime + audioEditorManager.editableTrack.currentStartTime,
            );

      const time = timelineController.realLocalPixelsToGlobal(
        timelineController.virtualToRealPixels(
          pageX - timelineController.startPageX,
        ),
      );

      return clamp(time, leftBound, rightBound);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioEditorManager, timelineController],
  );

  const setFadeTime = useCallback(
    (time: number) => {
      if (!audioEditorManager.editableTrack?.trackAudioFilters) {
        throw new Error('Editable track not found');
      }

      if (side === 'left') {
        audioEditorManager.editableTrack.trackAudioFilters.fadeInNode.linearFadeIn(
          0,
          time,
        );
      } else if (side === 'right') {
        audioEditorManager.editableTrack.trackAudioFilters.fadeOutNode.linearFadeOut(
          time,
          audioEditorManager.editableTrack.duration - time,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!audioEditorManager?.editableTrack?.trackAudioFilters) {
        return;
      }

      const time = getNewTime(e.pageX);

      const trackRelativeTime =
        time - audioEditorManager.editableTrack.currentStartTime;

      setFadeTime(trackRelativeTime);

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
    const update = () => {
      setPosition(
        timeToPosition(
          side === 'left'
            ? audioEditorManager.editableTrack?.trackAudioFilters?.fadeInNode
                .endTime ?? 0
            : audioEditorManager.editableTrack?.trackAudioFilters?.fadeOutNode
                .startTime ?? 0,
        ),
      );
    };

    timelineController.zoomController.addListener(update);

    return () => timelineController.zoomController.removeListener(update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineController, side]);

  return {
    position,
    fadeMarkerProps: {
      draggable: true,
      onDrag: handleDrag,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: preventAll,
      onDrop: preventAll,
    },
  };
};
