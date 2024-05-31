'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { useTimelineController } from '@/entities/audio-editor';
import { useTracksManager } from '@/entities/track';

import { TimelineGridMemoized } from '@/features/timeline';

import { AudioEditorTracksList } from '../AudioEditorTracksList';

import { TimelineProps } from './interfaces';

export const Timeline = observer(function Timeline({
  audioEditorManager,
  timelineRef,
  gridRef,
  className,
  ...props
}: TimelineProps) {
  const timelineController = useTimelineController();
  const tracksManager = useTracksManager();

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
              audioEditorManager.channelIds.length *
              timelineController.trackHeight
            }
            controlRef={gridRef}
          />
          <AudioEditorTracksList audioEditorManager={audioEditorManager} />
        </>
      )}
    </div>
  );
});
