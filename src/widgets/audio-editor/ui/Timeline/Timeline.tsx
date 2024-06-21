'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  useAudioEditorManager,
  useTimelineController,
} from '@/entities/audio-editor';
import { useTracksManager } from '@/entities/track';

import { TimelineGridMemoized, TimelineGridRef } from '@/features/timeline';

import { renderDefaultTimelineGrid } from '../../lib';
import { AudioEditorTracksList } from '../AudioEditorTracksList';

import { TimelineProps } from './interfaces';

export const Timeline = observer(function Timeline({
  timelineRef,
  children,
  className,
  ...props
}: TimelineProps) {
  const audioEditorManager = useAudioEditorManager();
  const timelineController = useTimelineController();
  const tracksManager = useTracksManager()!;

  const gridControlRef = useRef<TimelineGridRef | null>(null);

  const handleGridRef = useCallback((ref: TimelineGridRef | null) => {
    gridControlRef.current = ref;
    renderGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderGrid = useCallback(() => {
    renderDefaultTimelineGrid(
      gridControlRef,
      timelineController.ticks,
      timelineController.scroll,
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gridHeight = useMemo(
    () =>
      typeof timelineController.trackHeight === 'string'
        ? timelineController.trackHeight
        : audioEditorManager.channelIds.length * timelineController.trackHeight,
    [audioEditorManager.channelIds.length, timelineController.trackHeight],
  );

  useEffect(() => {
    timelineController.scrollController.addListener(renderGrid);
    timelineController.zoomController.addListener(renderGrid);
    return () => {
      timelineController.scrollController.removeListener(renderGrid);
      timelineController.zoomController.removeListener(renderGrid);
    };
  }, [renderGrid, timelineController]);

  return (
    <div
      className={cn(
        'relative min-h-max w-full grow overflow-x-clip',
        className,
      )}
      ref={timelineRef}
      {...props}
    >
      {tracksManager.loadedTracksCount !== tracksManager.tracksData.size ? (
        <span className='flex size-full flex-col items-center justify-center'>
          <span>{'Loading...'}</span>
          <span>{`${tracksManager.loadedTracksCount} / ${tracksManager.tracks.length}`}</span>
        </span>
      ) : (
        <>
          <TimelineGridMemoized
            className='pointer-events-none absolute w-full'
            height={gridHeight}
            controlRef={handleGridRef}
          />
          <AudioEditorTracksList audioEditorManager={audioEditorManager} />
          {children}
        </>
      )}
    </div>
  );
});
