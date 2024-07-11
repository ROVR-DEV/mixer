import { RefObject, useCallback, useMemo } from 'react';

import { Timeline } from '../model';

export const usePlayHead = (
  timeline: Timeline,
  playHeadRef: RefObject<HTMLDivElement>,
) => {
  const playHeadHeight = useMemo(
    () =>
      timeline.timelineClientHeight
        ? `calc(100% + ${timeline.timelineClientHeight}px)`
        : '100vh',
    [timeline.timelineClientHeight],
  );

  const getPlayHeadPosition = useCallback(
    (time: number) => {
      return (
        timeline.timeToVirtualPixels(time) -
        timeline.realToVirtualPixels(timeline.scroll) +
        timeline.timelineLeftPadding
      );
    },
    [timeline],
  );

  const setViewToPlayHead = useCallback(
    (playHeadPosition: number) => {
      const virtualScroll =
        timeline.realToVirtualPixels(timeline.scroll) +
        timeline.timelineLeftPadding;
      const globalPlayHeadPosition = playHeadPosition + virtualScroll;

      if (
        globalPlayHeadPosition < virtualScroll ||
        globalPlayHeadPosition > timeline.timelineClientWidth + virtualScroll
      ) {
        timeline.scroll =
          globalPlayHeadPosition / timeline.timelineContainer.pixelsPerSecond;
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
        playHeadX >= 0 && playHeadX <= timeline.timelineClientWidth;

      playHead.style.display = isPlayHeadVisible ? '' : 'none';
    },
    [playHeadRef, timeline.timelineClientWidth],
  );

  const updatePlayHead = useCallback(
    (time: number, isPlaying: boolean) => {
      const playHead = playHeadRef.current;
      if (!playHead) {
        return;
      }

      const newPosition = getPlayHeadPosition(time);

      setPlayHeadPosition(newPosition);
      if (isPlaying) {
        setViewToPlayHead(newPosition);
      }
      updatePlayHeadDisplayState(newPosition);
    },
    [
      getPlayHeadPosition,
      playHeadRef,
      setPlayHeadPosition,
      setViewToPlayHead,
      updatePlayHeadDisplayState,
    ],
  );

  return { playHeadRef, playHeadHeight, updatePlayHead };
};
