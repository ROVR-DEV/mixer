'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  TimelineContext,
  usePlayer,
  useHandleTimeSeek,
  useAudioEditor,
} from '@/entities/audio-editor';
import { TrackModifyOverlay, TrackWaveform } from '@/entities/track';

// eslint-disable-next-line boundaries/element-types
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
  const audioEditor = useAudioEditor();
  const player = usePlayer();

  const rulerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerRef,
    startTime: audioEditor.editableTrack?.isTrimming
      ? audioEditor.editableTrack.startTime
      : audioEditor.editableTrack?.trimStartTime,
    duration: (audioEditor.editableTrack?.duration ?? 0) + 2,
  });

  const waveformComponent = useMemo(
    () =>
      !audioEditor.editableTrack ? (
        <></>
      ) : (
        <TrackWaveform track={audioEditor.editableTrack} ignoreSelection />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioEditor.editableTrack],
  );

  const handleTimeSeek = useHandleTimeSeek(player, timelineController);

  useEffect(() => {
    if (!audioEditor.editableTrack) {
      return;
    }

    if (
      audioEditor.editableTrack.isTrimming &&
      timelineController.scroll > audioEditor.editableTrack.trimStartTime
    ) {
      timelineController.scroll = audioEditor.editableTrack.trimStartTime;
    }
  }, [
    audioEditor.editableTrack,
    audioEditor.editableTrack?.isTrimming,
    audioEditor.editableTrack?.trimStartTime,
    timelineController,
  ]);

  useEffect(() => {
    if (!audioEditor.editableTrack) {
      return;
    }

    timelineController.scroll = audioEditor.editableTrack.trimStartTime;
  }, [audioEditor.editableTrack, timelineController]);

  return (
    <TimelineContext.Provider value={timelineController}>
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
            {!audioEditor.editableTrack ? null : (
              <ChannelListItemView
                className='relative size-full'
                channel={audioEditor.editableTrack?.channel}
                ignoreSelection
              >
                <AudioEditorTrackView
                  className='h-[calc(100%-14px)]'
                  key={`track-${audioEditor.editableTrack.id}-editable`}
                  track={audioEditor.editableTrack}
                  waveformComponent={waveformComponent}
                  disableInteractive
                  hideTitle
                >
                  <TrackModifyOverlay
                    track={audioEditor.editableTrack}
                    ignoreSelection
                  />
                </AudioEditorTrackView>
              </ChannelListItemView>
            )}
          </div>
          <TimelineScrollView />
        </div>
      </div>
    </TimelineContext.Provider>
  );
});
