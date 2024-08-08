'use client';

import { throttle } from 'lodash-es';
import { useCallback } from 'react';

import { clamp } from '@/shared/lib';
import { CustomDragEventHandler } from '@/shared/model';
import { CustomDraggableProps } from '@/shared/ui';

import {
  Timeline,
  useAudioEditor,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, AudioEditorTrack } from '../model';

export interface UseFadeMarkerDnDProps {
  side: FadeSide;
  track: AudioEditorTrack | null;
  timeline: Timeline;
}

const setFadeThrottle = throttle(
  (time: number, track: AudioEditorTrack, side: FadeSide) => {
    const clampedTime = clamp(time, 0, track.duration);

    if (side === 'left') {
      track.filters.setFadeInEndTime(clampedTime);
    } else if (side === 'right') {
      track.filters.setFadeOutStartTime(clampedTime);
    }
  },
);

type CustomData = {
  startX: number;
  startTime: number;
};

export const useFadeMarkerDnD = ({
  side,
  track,
  timeline,
}: UseFadeMarkerDnDProps): Pick<
  CustomDraggableProps,
  'onDrag' | 'onStart' | 'onStop'
> => {
  const audioEditor = useAudioEditor();

  const onStart: CustomDragEventHandler<CustomData> = useCallback(
    (_, data, customData) => {
      customData.startX = data.x;
      customData.startTime =
        side === 'left'
          ? track?.filters.fadeInNode.endTime
          : track?.filters.fadeOutNode.startTime;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      side,
      track?.filters.fadeInNode.endTime,
      track?.filters.fadeOutNode.startTime,
    ],
  );

  const onDrag: CustomDragEventHandler<CustomData> = useCallback(
    (_, data, customData) => {
      if (!track?.filters) {
        return;
      }

      if (
        customData.startX === undefined ||
        customData.startTime === undefined
      ) {
        return;
      }

      const timeOffset =
        timeline.pixelsToTime(data.x) -
        timeline.pixelsToTime(customData.startX);

      const newTime = customData.startTime + timeOffset;

      setFadeThrottle(newTime, track, side);
    },
    [side, timeline, track],
  );

  const onStop = useCallback(() => {
    audioEditor.saveState();
  }, [audioEditor]);

  return {
    onStart,
    onDrag,
    onStop,
  };
};
