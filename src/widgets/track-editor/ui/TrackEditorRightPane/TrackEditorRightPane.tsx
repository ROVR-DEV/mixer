'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  TimelineControllerContext,
  useAudioEditorManager,
  useHandleTimeSeek,
} from '@/entities/audio-editor';
import { FadeOverlay, TrackWaveform, TrimMarker } from '@/entities/track';

import { ChannelListItemView } from '@/features/channel-control';
import { TimelineScrollView } from '@/features/timeline';
import { AudioEditorTrackView } from '@/features/track-card-view';

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
    startTime: audioEditorManager.editableTrack?.isTrimming
      ? audioEditorManager.editableTrack.startTime
      : audioEditorManager.editableTrack?.trimStartTime,
    duration: audioEditorManager.editableTrack?.duration ?? 0,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioEditorManager.editableTrack],
  );

  const handleTimeSeek = useHandleTimeSeek(
    audioEditorManager,
    timelineController,
  );

  useEffect(() => {
    if (!audioEditorManager.editableTrack) {
      return;
    }

    if (
      audioEditorManager.editableTrack.isTrimming &&
      timelineController.scroll > audioEditorManager.editableTrack.trimStartTime
    ) {
      timelineController.scroll =
        audioEditorManager.editableTrack.trimStartTime;
    }
  }, [
    audioEditorManager.editableTrack,
    audioEditorManager.editableTrack?.isTrimming,
    audioEditorManager.editableTrack?.trimStartTime,
    timelineController,
  ]);

  useEffect(() => {
    if (!audioEditorManager.editableTrack) {
      return;
    }

    timelineController.scroll = audioEditorManager.editableTrack.trimStartTime;
  }, [audioEditorManager.editableTrack, timelineController]);

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
                <AudioEditorTrackView
                  className='h-[calc(100%-14px)]'
                  key={`track-${audioEditorManager.editableTrack.uuid}-editable`}
                  track={audioEditorManager.editableTrack}
                  audioEditorManager={audioEditorManager}
                  waveformComponent={waveformComponent}
                  disableInteractive
                  hideTitle
                >
                  <TrimMarker
                    className='absolute bottom-0 left-0 z-20'
                    side='left'
                    track={audioEditorManager.editableTrack}
                  />
                  <TrimMarker
                    className='absolute bottom-0 right-0 z-20'
                    side='right'
                    track={audioEditorManager.editableTrack}
                  />
                  <FadeOverlay
                    className='absolute top-0 z-20'
                    side='left'
                    track={audioEditorManager.editableTrack}
                  />
                  <FadeOverlay
                    className='absolute top-0 z-20'
                    side='right'
                    track={audioEditorManager.editableTrack}
                  />
                </AudioEditorTrackView>
              </ChannelListItemView>
            )}
          </div>
          <TimelineScrollView />
        </div>
      </div>
    </TimelineControllerContext.Provider>
  );
});
