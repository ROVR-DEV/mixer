'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import { usePlayer, usePlayHead, useTimeline } from '@/entities/audio-editor';

import { TimelinePlayHeadMemoized } from '../TimelinePlayHead';

import { TimelinePlayHeadViewProps } from './interfaces';

export const TimelinePlayHeadView = observer(function TimelinePlayHeadView({
  initialPosition,
  ...props
}: TimelinePlayHeadViewProps) {
  const playHeadRef = useRef<HTMLDivElement | null>(null);

  const player = usePlayer();
  const timeline = useTimeline();

  const { playHeadHeight, updatePlayHead } = usePlayHead(timeline, playHeadRef);

  const renderPlayHead = useCallback(
    (time: number) =>
      requestAnimationFrame(() => updatePlayHead(time, player.isPlaying)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatePlayHead],
  );

  useEffect(() => {
    renderPlayHead(player.time);

    player.events.on('timeupdate', renderPlayHead);
    return () => {
      player.events.off('timeupdate', renderPlayHead);
    };
  }, [player, renderPlayHead]);

  useEffect(() => {
    const update = () => {
      renderPlayHead(player.time);
    };
    update();

    timeline.zoomController.addListener(update);
    timeline.hScrollController.addListener(update);
    return () => {
      timeline.zoomController.removeListener(update);
      timeline.hScrollController.removeListener(update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderPlayHead, timeline.hScrollController, timeline.zoomController]);

  return (
    <TimelinePlayHeadMemoized
      ref={playHeadRef}
      initialPosition={initialPosition || timeline.zeroMarkOffsetX}
      style={{
        height: playHeadHeight,
      }}
      {...props}
    />
  );
});
