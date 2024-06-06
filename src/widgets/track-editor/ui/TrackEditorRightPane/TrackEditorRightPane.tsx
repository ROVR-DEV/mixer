'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  TimelineControllerContext,
  useAudioEditorManager,
  useHandleTimeSeek,
} from '@/entities/audio-editor';

import { ChannelListItemView } from '@/features/channel-control';
import { TimelineScrollView } from '@/features/timeline';
import { TrackCardView } from '@/features/track-card-view';

// eslint-disable-next-line boundaries/element-types
import { TimelineHeader, useTimelineZoomScroll } from '@/widgets/audio-editor';

import { TrackEditorRightPaneProps } from './interfaces';

export const TrackEditorRightPane = observer(function TrackEditorRightPane({
  className,
  ...props
}: TrackEditorRightPaneProps) {
  const audioEditorManager = useAudioEditorManager();

  const rulerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerRef,
    playlistTotalTime: audioEditorManager.selectedTrack?.duration ?? 0,
  });

  useEffect(() => {
    if (!audioEditorManager.editableTrack) {
      return;
    }

    timelineController.scroll =
      audioEditorManager.editableTrack.currentStartTime;
  }, [audioEditorManager.editableTrack, timelineController]);

  const handleTimeSeek = useHandleTimeSeek(
    audioEditorManager,
    timelineController,
  );

  return (
    <TimelineControllerContext.Provider value={timelineController}>
      <div className={cn('flex flex-col', className)} {...props}>
        <TimelineHeader
          className='h-16 min-h-16'
          rulerRef={rulerRef}
          centerLine={false}
        />
        <div className='flex size-full flex-col overflow-hidden'>
          <div
            className='size-full grow overflow-x-clip'
            ref={timelineRef}
            onMouseUp={handleTimeSeek}
          >
            {!audioEditorManager.editableTrack ? null : (
              <ChannelListItemView
                className='relative size-full'
                audioEditorManager={audioEditorManager}
                channel={audioEditorManager.editableTrack?.channel}
                ignoreSelection
                disableBorder
              >
                <TrackCardView
                  className='pointer-events-none h-[calc(100%-14px)]'
                  key={`track-${audioEditorManager.editableTrack.uuid}-editable`}
                  track={audioEditorManager.editableTrack}
                  audioEditorManager={audioEditorManager}
                  ignoreSelection
                />
              </ChannelListItemView>
            )}
          </div>
          <TimelineScrollView />
        </div>
      </div>
    </TimelineControllerContext.Provider>
  );
});
