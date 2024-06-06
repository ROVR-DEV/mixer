'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  useAudioEditorManager,
  useTimelineController,
} from '@/entities/audio-editor';
import { useTracksManager } from '@/entities/track';

import { TimelineGridMemoized, TimelineGridRef } from '@/features/timeline';

import { useAudioEditorTimelineGrid } from '../../lib';
import { AudioEditorTracksList } from '../AudioEditorTracksList';

import { TimelineProps } from './interfaces';

export const Timeline = observer(function Timeline({
  timelineRef,
  className,
  ...props
}: TimelineProps) {
  const audioEditorManager = useAudioEditorManager();
  const timelineController = useTimelineController();
  const tracksManager = useTracksManager()!;

  const gridControlRef = useRef<TimelineGridRef | null>(null);

  const renderGrid = useAudioEditorTimelineGrid(gridControlRef);

  useEffect(() => {
    renderGrid(
      timelineController.ticks,
      timelineController.scroll,
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.timelineLeftPadding,
    );
  }, [
    renderGrid,
    timelineController.scroll,
    timelineController.ticks,
    timelineController.timelineContainer.pixelsPerSecond,
    timelineController.timelineLeftPadding,
  ]);

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
            className='absolute w-full'
            height={
              typeof timelineController.trackHeight === 'string'
                ? timelineController.trackHeight
                : audioEditorManager.channelIds.length *
                  timelineController.trackHeight
            }
            controlRef={gridControlRef}
          />
          <AudioEditorTracksList audioEditorManager={audioEditorManager} />
        </>
      )}
    </div>
  );
});
