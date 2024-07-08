'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import {
  usePlayer,
  usePlayHead,
  useTimelineController,
} from '@/entities/audio-editor';

import { TimelinePlayHeadMemoized } from '../TimelinePlayHead';

import { TimelinePlayHeadViewProps } from './interfaces';

export const TimelinePlayHeadView = observer(function TimelinePlayHeadView({
  initialPosition,
  ...props
}: TimelinePlayHeadViewProps) {
  const playHeadRef = useRef<HTMLDivElement | null>(null);

  const player = usePlayer();
  const timelineController = useTimelineController();

  const { playHeadHeight, updatePlayHead } = usePlayHead(
    timelineController,
    playHeadRef,
  );

  const renderPlayHead = useCallback(
    (time: number) =>
      requestAnimationFrame(() => updatePlayHead(time, player.isPlaying)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatePlayHead],
  );

  useEffect(() => {
    renderPlayHead(player.time);

    player.on('timeupdate', renderPlayHead);
    return () => player.off('timeupdate', renderPlayHead);
  }, [player, renderPlayHead]);

  useEffect(() => {
    const update = () => {
      renderPlayHead(player.time);
    };
    update();

    timelineController.zoomController.addListener(update);
    timelineController.scrollController.addListener(update);
    return () => {
      timelineController.zoomController.removeListener(update);
      timelineController.scrollController.removeListener(update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    renderPlayHead,
    timelineController.scrollController,
    timelineController.zoomController,
  ]);

  return (
    <TimelinePlayHeadMemoized
      ref={playHeadRef}
      initialPosition={
        initialPosition || timelineController.timelineLeftPadding
      }
      style={{
        height: playHeadHeight,
      }}
      {...props}
    />
  );
});
