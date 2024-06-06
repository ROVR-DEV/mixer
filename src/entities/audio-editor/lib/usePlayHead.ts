import { RefObject, useCallback, useMemo } from 'react';

import { TimelineController } from '../model';

export const usePlayHead = (
  timelineController: TimelineController,
  playHeadRef: RefObject<HTMLDivElement>,
) => {
  const playHeadHeight = useMemo(
    () =>
      timelineController.timelineClientHeight
        ? `calc(100% + ${timelineController.timelineClientHeight}px)`
        : '100vh',
    [timelineController.timelineClientHeight],
  );

  const getPlayHeadPosition = useCallback(
    (time: number) => {
      return (
        timelineController.timeToVirtualPixels(time) -
        timelineController.realToVirtualPixels(timelineController.scroll)
      );
    },
    [timelineController],
  );

  const setViewToPlayHead = useCallback(
    (playHeadPosition: number) => {
      const virtualScroll =
        timelineController.realToVirtualPixels(timelineController.scroll) +
        timelineController.timelineLeftPadding;
      const globalPlayHeadPosition = playHeadPosition + virtualScroll;

      if (
        globalPlayHeadPosition < virtualScroll ||
        globalPlayHeadPosition >
          timelineController.timelineClientWidth + virtualScroll
      ) {
        timelineController.scroll =
          globalPlayHeadPosition /
          timelineController.timelineContainer.pixelsPerSecond;
      }
    },
    [timelineController],
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
        playHeadX >= 0 && playHeadX <= timelineController.timelineClientWidth;

      playHead.style.display = isPlayHeadVisible ? '' : 'none';
    },
    [playHeadRef, timelineController.timelineClientWidth],
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
