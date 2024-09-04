'use client';

import { useCallback } from 'react';

import { CustomDragEventHandler } from '@/shared/model';
import { CustomDraggableProps } from '@/shared/ui';

import {
  AudioEditor,
  getTimeAfterDrag,
  isAudioEditorDragDataFilled,
  Timeline,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, AudioEditorTrack } from '../model';

import { updateFade } from './updateFade';

type CustomDragData = {
  startX: number;
  startTime: number;
};

export interface UseFadeMarkerDnDProps {
  side: FadeSide;
  track: AudioEditorTrack | null;
  timeline: Timeline;
  // If provided saving state on drag ends
  audioEditor?: AudioEditor;
}

export const useFadeMarkerDnD = ({
  side,
  track,
  timeline,
  audioEditor,
}: UseFadeMarkerDnDProps): Pick<
  CustomDraggableProps,
  'onDrag' | 'onStart' | 'onStop'
> => {
  const onStart: CustomDragEventHandler<CustomDragData> = useCallback(
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

  const onDrag: CustomDragEventHandler<CustomDragData> = useCallback(
    (_, data, customData) => {
      if (!track?.filters) {
        return;
      }

      if (!isAudioEditorDragDataFilled(customData)) {
        return;
      }

      const newTime = getTimeAfterDrag(timeline, data, customData);

      requestAnimationFrame(() => updateFade(newTime, track, side));
    },
    [side, timeline, track],
  );

  const onStop = useCallback(() => {
    audioEditor?.saveState();
  }, [audioEditor]);

  return {
    onStart,
    onDrag,
    onStop,
  };
};
