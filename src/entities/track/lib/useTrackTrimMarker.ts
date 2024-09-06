'use client';

import { throttle } from 'lodash-es';
import { useCallback } from 'react';

import { clamp, useRepeatFun } from '@/shared/lib';
import { CustomDragEventHandler } from '@/shared/model';
import { TrimSide } from '@/shared/ui';

import {
  AudioEditorDragData,
  isAudioEditorDragDataFilled,
  shiftXTimeline,
  Timeline,
  useAudioEditor,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { MIN_TRACK_DURATION } from '../config';
import { AudioEditorTrack, Side } from '../model';

import { getTrackNeighbors } from './getTrackNeighbors';

export interface UseTrimMarkerProps {
  side: TrimSide;
  track: AudioEditorTrack | null;
  timeline: Timeline;
}

const setTrim = throttle(
  (
    track: AudioEditorTrack | null,
    time: number,
    side: Side,
    leftTimeBound?: number,
    rightTimeBound?: number,
  ) => {
    if (!track) {
      return;
    }

    const clampedTime = clamp(
      time,
      Math.max(0, track.startTime, leftTimeBound ?? 0),
      Math.min(track.endTime, rightTimeBound ?? Infinity),
    );

    if (side === 'left') {
      const leftTime = clamp(
        clampedTime,
        -Infinity,
        track.trimEndTime - MIN_TRACK_DURATION,
      );

      track.setStartTrimDuration(leftTime - track.startTime);
    } else if (side === 'right') {
      const rightTime = clamp(
        clampedTime,
        track.trimStartTime + MIN_TRACK_DURATION,
        Infinity,
      );

      track.setEndTrimDuration(track.endTime - rightTime);
    }
  },
  3,
);

type TrackTrimDragData = AudioEditorDragData & {
  leftTimeBound: number;
  rightTimeBound: number;
};

export const useTrackTrimMarkerDnD = ({
  track,
  timeline,
  side,
}: UseTrimMarkerProps) => {
  const audioEditor = useAudioEditor();

  const onStart: CustomDragEventHandler<TrackTrimDragData> = useCallback(
    (_, data, customData) => {
      if (!track) {
        return;
      }

      if (!track.isTrimming) {
        track.isTrimming = true;
      }

      const { leftNeighbor, rightNeighbor } = getTrackNeighbors(track);

      customData.startX = data.x;
      customData.startTime =
        side === 'left' ? track.trimStartTime : track.trimEndTime;

      customData.leftTimeBound = leftNeighbor?.trimEndTime ?? 0;
      customData.rightTimeBound = rightNeighbor?.trimStartTime ?? Infinity;
    },
    [track, side],
  );

  const updateTrim: CustomDragEventHandler<TrackTrimDragData> = useCallback(
    (_, data, customData) => {
      if (!isAudioEditorDragDataFilled(customData)) {
        return;
      }

      setTrim(
        track,
        timeline.mapGlobalToTime(data.x),
        side,
        customData.leftTimeBound,
        customData.rightTimeBound,
      );
    },
    [side, timeline, track],
  );

  const { repeat: repeatDragUpdate, stop: stopDragUpdate } = useRepeatFun();

  const onDrag: CustomDragEventHandler<TrackTrimDragData> = useCallback(
    (e, data, customData) => {
      if (!track) {
        return;
      }

      const dragTime = timeline.mapGlobalToTime(data.x);

      if (dragTime < track.startTime || dragTime > track.endTime) {
        stopDragUpdate();
        updateTrim(e, data, customData);
        return;
      }

      repeatDragUpdate(() => {
        shiftXTimeline(data.x, timeline);
        updateTrim(e, data, customData);
      });
    },
    [repeatDragUpdate, stopDragUpdate, timeline, track, updateTrim],
  );

  const onStop = useCallback(() => {
    stopDragUpdate();

    if (!track) {
      return;
    }

    if (track.isTrimming) {
      track.isTrimming = false;
      adjustTracksOnPaste(track);
      audioEditor.saveState();
    }
  }, [audioEditor, stopDragUpdate, track]);

  return {
    onStart,
    onDrag,
    onStop,
  };
};
