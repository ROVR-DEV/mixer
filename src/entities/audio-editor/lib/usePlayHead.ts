import { RefObject, useCallback, useMemo } from 'react';

import { Timeline } from '../model';

const TIMELINE_AFTER_SCROLL_VIEW_PADDING = 4;

export const usePlayHead = (
  timeline: Timeline,
  playHeadRef: RefObject<HTMLDivElement>,
) => {
  const playHeadHeight = useMemo(
    () =>
      timeline.clientHeight
        ? `calc(100% + ${timeline.clientHeight}px)`
        : '100vh',
    [timeline.clientHeight],
  );

  const setViewToPlayHead = useCallback(
    (playHeadPosition: number) => {
      const globalPlayHeadPosition = playHeadPosition + timeline.hScroll;

      if (
        (globalPlayHeadPosition < timeline.hScroll ||
          globalPlayHeadPosition > timeline.clientWidth + timeline.hScroll) &&
        !timeline.interactedBefore
      ) {
        timeline.hScroll =
          globalPlayHeadPosition - TIMELINE_AFTER_SCROLL_VIEW_PADDING;
      }
    },
    [timeline],
  );

  const setPlayHeadPosition = useCallback(
    (x: number) => {
      const playHead = playHeadRef.current;
      if (!playHead) {
        return;
      }

      playHead.style.left = `${x}px`;
    },
    [playHeadRef],
  );

  const updatePlayHeadDisplayState = useCallback(
    (playHeadX: number) => {
      const playHead = playHeadRef.current;
      if (!playHead) {
        return;
      }

      const isPlayHeadVisible =
        playHeadX >= 0 && playHeadX <= timeline.clientWidth;

      playHead.style.display = isPlayHeadVisible ? '' : 'none';
    },
    [playHeadRef, timeline.clientWidth],
  );

  const updatePlayHead = useCallback(
    (time: number, isPlaying: boolean) => {
      const playHead = playHeadRef.current;
      if (!playHead) {
        return;
      }

      const newPosition = timeline.timeToLocal(time);

      setPlayHeadPosition(newPosition);
      if (isPlaying) {
        setViewToPlayHead(newPosition);
      }
      updatePlayHeadDisplayState(newPosition);
    },
    [
      playHeadRef,
      setPlayHeadPosition,
      setViewToPlayHead,
      timeline,
      updatePlayHeadDisplayState,
    ],
  );

  return { playHeadRef, playHeadHeight, updatePlayHead };
};
