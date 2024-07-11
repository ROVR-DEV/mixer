'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import { usePlayer, useTimelineController } from '@/entities/audio-editor';
import { useTracksManager } from '@/entities/track';

import { TimelineGridMemoized, TimelineGridRef } from '@/features/timeline';

import { renderDefaultTimelineGrid } from '../../lib';
import { AudioEditorTracksList } from '../AudioEditorTracksList';
import { TimelineChannelsList } from '../TimelineChannelsList';

import { TimelineProps } from './interfaces';

export const TimelineView = observer(function TimelineView({
  timelineRef,
  children,
  className,
  ...props
}: TimelineProps) {
  const player = usePlayer();
  const timeline = useTimelineController();
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
      timeline.ticks,
      timeline.scroll,
      timeline.timelineContainer.pixelsPerSecond,
      timeline.timelineLeftPadding,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gridHeight = useMemo(
    () =>
      typeof timeline.trackHeight === 'string'
        ? timeline.trackHeight
        : player.channels.length * timeline.trackHeight,
    [player.channels.length, timeline.trackHeight],
  );

  useEffect(() => {
    timeline.scrollController.addListener(renderGrid);
    timeline.zoomController.addListener(renderGrid);

    renderGrid();
    return () => {
      timeline.scrollController.removeListener(renderGrid);
      timeline.zoomController.removeListener(renderGrid);
    };
  }, [renderGrid, timeline]);

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
          <div className='absolute size-full'>
            <TimelineChannelsList />
          </div>
          <TimelineGridMemoized
            className='pointer-events-none absolute w-full'
            height={gridHeight}
            controlRef={handleGridRef}
          />
          <AudioEditorTracksList player={player} />
          {children}
        </>
      )}
    </div>
  );
});
