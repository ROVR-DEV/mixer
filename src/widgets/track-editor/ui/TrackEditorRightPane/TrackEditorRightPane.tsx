'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  TimelineControllerContext,
  useAudioEditorManager,
  useHandleTimeSeek,
} from '@/entities/audio-editor';
import { FadeOverlay, TrackWaveform } from '@/entities/track';

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
    startTime: audioEditorManager.editableTrack?.currentStartTime,
    duration: audioEditorManager.editableTrack?.duration ?? 0,
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

  const waveformComponent = useMemo(
    () =>
      !audioEditorManager.editableTrack ? (
        <></>
      ) : (
        <TrackWaveform
          audioEditorManager={audioEditorManager}
          track={audioEditorManager.editableTrack}
          ignoreSelection
        />
      ),
    [audioEditorManager],
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
                  className='h-[calc(100%-14px)]'
                  key={`track-${audioEditorManager.editableTrack.uuid}-editable`}
                  track={audioEditorManager.editableTrack}
                  audioEditorManager={audioEditorManager}
                  waveformComponent={waveformComponent}
                  disableInteractive
                  hideTitle
                >
                  <FadeOverlay
                    className='absolute top-0 z-10'
                    side='left'
                    audioEditorManager={audioEditorManager}
                  />
                  <FadeOverlay
                    className='absolute top-0 z-10'
                    side='right'
                    audioEditorManager={audioEditorManager}
                  />
                </TrackCardView>
              </ChannelListItemView>
            )}
          </div>
          <TimelineScrollView />
        </div>
      </div>
    </TimelineControllerContext.Provider>
  );
});
