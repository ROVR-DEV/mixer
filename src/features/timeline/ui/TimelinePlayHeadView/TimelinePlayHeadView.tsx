'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useTimelineController } from '@/entities/audio-editor';

import { TimelinePlayHeadMemoized } from '../TimelinePlayHead';

import { TimelinePlayHeadViewProps } from './interfaces';

export const TimelinePlayHeadView = observer(function TimelinePlayHeadView({
  audioEditorManager,
  initialPosition,
  ...props
}: TimelinePlayHeadViewProps) {
  const playHeadRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineController();

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
          globalPlayHeadPosition / timelineController.pixelsPerSecond;
      }
    },
    [timelineController],
  );

  const updatePlayHead = useCallback(
    (time: number) => {
      const playHead = playHeadRef.current;
      if (!playHead) {
        return;
      }

      const newPosition = getPlayHeadPosition(time);
      playHead.style.left = `${newPosition}px`;

      if (audioEditorManager.isPlaying) {
        setViewToPlayHead(newPosition);
      }

      playHead.style.display =
        newPosition < 0 || newPosition > timelineController.timelineClientWidth
          ? 'none'
          : '';
    },
    [
      audioEditorManager.isPlaying,
      getPlayHeadPosition,
      setViewToPlayHead,
      timelineController.timelineClientWidth,
    ],
  );

  useEffect(() => {
    const renderPlayHead = (time: number) => {
      requestAnimationFrame(() => updatePlayHead(time));
    };

    audioEditorManager.addListener(renderPlayHead);

    return () => audioEditorManager.removeListener(renderPlayHead);
  }, [audioEditorManager, updatePlayHead]);

  return (
    <TimelinePlayHeadMemoized
      ref={playHeadRef}
      initialPosition={initialPosition}
      style={{
        height: playHeadHeight,
      }}
      {...props}
    />
  );
});
