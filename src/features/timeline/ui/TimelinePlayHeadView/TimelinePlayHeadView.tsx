'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef } from 'react';

import {
  useAudioEditorManager,
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

  const audioEditorManager = useAudioEditorManager();
  const timelineController = useTimelineController();

  const { playHeadHeight, updatePlayHead } = usePlayHead(
    timelineController,
    playHeadRef,
  );

  const renderPlayHead = useCallback(
    (time: number) =>
      requestAnimationFrame(() =>
        updatePlayHead(time, audioEditorManager.isPlaying),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatePlayHead],
  );

  useEffect(() => {
    renderPlayHead(audioEditorManager.time);
    audioEditorManager.addListener(renderPlayHead);
    return () => audioEditorManager.removeListener(renderPlayHead);
  }, [audioEditorManager, renderPlayHead]);

  useEffect(() => {
    const update = () => {
      renderPlayHead(audioEditorManager.time);
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
