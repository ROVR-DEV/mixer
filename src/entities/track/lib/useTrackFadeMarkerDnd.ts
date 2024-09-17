'use client';

import { useCallback } from 'react';

import { useRepeatFun } from '@/shared/lib';
import { CustomDragEventHandler } from '@/shared/model';
import { CustomDraggableProps } from '@/shared/ui';

import {
  AudioEditor,
  isMouseInScrollBounds,
  shiftXTimeline,
  Timeline,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, AudioEditorTrack } from '../model';

import { updateFade } from './updateFade';

export interface UseFadeMarkerDnDProps {
  side: FadeSide;
  track: AudioEditorTrack | null;
  timeline: Timeline;
  // If provided saving state on drag ends
  audioEditor?: AudioEditor;
}

export const useTrackFadeMarkerDnD = ({
  side,
  track,
  timeline,
  audioEditor,
}: UseFadeMarkerDnDProps): Pick<
  CustomDraggableProps,
  'onDrag' | 'onStart' | 'onStop'
> => {
  const onStart: CustomDragEventHandler = useCallback(() => {}, []);

  const { repeat: repeatFadeUpdate, stop: stopFadeUpdate } = useRepeatFun();

  const onDrag: CustomDragEventHandler = useCallback(
    (_, data) => {
      if (!track?.filters) {
        return;
      }

      repeatFadeUpdate(() => {
        const globalTime = timeline.globalToTime(data.x);
        const trackTime = track.getRelativeTime(globalTime);

        const bounds = isMouseInScrollBounds(data.x, timeline);

        if (
          (bounds.leftBound === undefined && bounds.rightBound === undefined) ||
          globalTime < track.startTime ||
          globalTime > track.endTime
        ) {
          stopFadeUpdate();
          updateFade(track, trackTime, side);
          return false;
        }

        shiftXTimeline(data.x, timeline);
        updateFade(track, trackTime, side);
      });
    },
    [repeatFadeUpdate, side, stopFadeUpdate, timeline, track],
  );

  const onStop: CustomDragEventHandler = useCallback(() => {
    stopFadeUpdate();
    audioEditor?.saveState();
  }, [audioEditor, stopFadeUpdate]);

  return {
    onStart,
    onDrag,
    onStop,
  };
};
