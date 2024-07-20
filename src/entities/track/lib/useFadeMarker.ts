'use client';

import { throttle } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { clamp, preventAll, useListener } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';
import { DnDData } from '@/shared/model';

import {
  Timeline,
  useAudioEditor,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';

import { FadeSide, AudioEditorTrack, Side } from '../model';

import { getFadeMarkerAriaAttributes } from './fadeMarkerAria';

export interface UseFadeMarkerProps {
  side: FadeSide;
  track: AudioEditorTrack | null;
  timeline: Timeline;
}

const setFade = throttle(
  (track: AudioEditorTrack, time: number, side: Side) => {
    if (!track?.filters) {
      throw new Error('Editable track not found');
    }

    if (side === 'left') {
      track?.filters.fadeInNode.linearFadeIn(
        track.startTrimDuration,
        time - track.startTrimDuration,
      );

      if (
        track.filters.fadeInNode.endTime > track.filters.fadeOutNode.startTime
      ) {
        setFade(track, track.filters.fadeInNode.endTime, 'right');
      }
    } else if (side === 'right') {
      track?.filters.fadeOutNode.linearFadeOut(
        time,
        track.duration - track.endTrimDuration - time,
      );

      if (
        track.filters.fadeOutNode.startTime < track.filters.fadeInNode.endTime
      ) {
        setFade(track, track.filters.fadeOutNode.startTime, 'left');
      }
    }
  },
);

interface FadeMarkerDnDData extends DnDData<{ startTime: number }> {}

export const useFadeMarker = ({
  side,
  track,
  timeline,
}: UseFadeMarkerProps): {
  width: number;
  fadeMarkerProps: React.ComponentPropsWithoutRef<'div'>;
} => {
  const audioEditor = useAudioEditor();

  const getMarkerStartTime = useCallback(
    () =>
      side === 'left'
        ? (track?.filters?.fadeInNode.endTime ?? 0) -
          (track?.startTrimDuration ?? 0)
        : (track?.filters?.fadeOutNode.startTime ?? 0) -
          (track?.startTrimDuration ?? 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const currentTime = useMemo(
    () => getMarkerStartTime(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getMarkerStartTime,
      track?.filters?.fadeInNode.endTime,
      track?.filters?.fadeOutNode.startTime,
      track?.startTrimDuration,
      track?.endTrimDuration,
    ],
  );

  const ariaAttributes = useMemo(
    () =>
      getFadeMarkerAriaAttributes(track?.trimDuration ?? 0, side, currentTime),
    [currentTime, side, track?.trimDuration],
  );

  const clampTime = useCallback(
    (time: number) => {
      return clamp(time, 0, track?.duration);
    },
    [track],
  );

  const [width, setWidth] = useState(
    timeline.timeToVirtualPixels(getMarkerStartTime()),
  );

  const updateWidth = useCallback(() => {
    if (!track) {
      return;
    }

    const startTime = getMarkerStartTime();

    setWidth(
      clamp(
        timeline.timeToVirtualPixels(
          side === 'left' ? startTime : track.trimDuration - startTime,
        ),
        0,
      ),
    );
  }, [getMarkerStartTime, side, timeline, track]);

  const handleDragStart = useCallback(
    (
      e: MouseEvent | React.MouseEvent<HTMLElement>,
      dndData: FadeMarkerDnDData,
    ) => {
      if (!track?.filters) {
        return;
      }

      dndData.customProperties.startTime =
        side === 'left'
          ? track?.filters.fadeInNode.endTime
          : track?.filters.fadeOutNode.startTime;
    },
    [side, track?.filters],
  );

  const handleDrag = useCallback(
    (
      e: MouseEvent | React.MouseEvent<HTMLElement>,
      dndData: FadeMarkerDnDData,
    ) => {
      if (!track?.filters) {
        return;
      }

      if (dndData.customProperties?.startTime === undefined) {
        return;
      }

      const timeOffset =
        timeline.pixelsToTime(dndData.currentPosition.x) -
        timeline.pixelsToTime(dndData.startPosition.x);

      const time = clampTime(dndData.customProperties.startTime + timeOffset);

      setFade(track, time, side);
    },
    [clampTime, side, timeline, track],
  );

  const handleDragEnd = useCallback(() => {
    audioEditor.saveState();
  }, [audioEditor]);

  const { onMouseUp, onMouseDown } = useGlobalDnD({
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
  });

  useEffect(() => {
    updateWidth();
  }, [
    track?.filters?.fadeInNode.endTime,
    track?.filters?.fadeOutNode.startTime,
    updateWidth,
  ]);

  useListener(
    timeline.zoomController.addListener,
    timeline.zoomController.removeListener,
    updateWidth,
  );

  return {
    width,
    fadeMarkerProps: {
      onClick: preventAll,
      onMouseUp: onMouseUp,
      onMouseDown: onMouseDown,
      ...ariaAttributes,
    },
  };
};
