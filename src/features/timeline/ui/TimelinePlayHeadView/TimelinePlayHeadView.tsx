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
  const timeline = useTimelineController();

  const { playHeadHeight, updatePlayHead } = usePlayHead(timeline, playHeadRef);

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

    timeline.zoomController.addListener(update);
    timeline.scrollController.addListener(update);
    return () => {
      timeline.zoomController.removeListener(update);
      timeline.scrollController.removeListener(update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderPlayHead, timeline.scrollController, timeline.zoomController]);

  return (
    <TimelinePlayHeadMemoized
      ref={playHeadRef}
      initialPosition={initialPosition || timeline.timelineLeftPadding}
      style={{
        height: playHeadHeight,
      }}
      {...props}
    />
  );
});
