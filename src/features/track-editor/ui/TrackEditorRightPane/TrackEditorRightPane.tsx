'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { cn, useIsMouseClickStartsOnThisSpecificElement } from '@/shared/lib';

import {
  TimelineContext,
  usePlayer,
  useHandleTimeSeek,
  useAudioEditor,
} from '@/entities/audio-editor';
import { TrackModifyOverlay, TrackWaveform } from '@/entities/track';

// eslint-disable-next-line boundaries/element-types
import { ChannelListItemView } from '@/features/channel-control';
// eslint-disable-next-line boundaries/element-types
import {
  TimelineScrollView,
  useTimelineInitialize,
  useTimelineWheelHandler,
  // eslint-disable-next-line boundaries/element-types
} from '@/features/timeline';
// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrackView } from '@/features/track-card-view';

// eslint-disable-next-line boundaries/element-types
import { TimelineHeader } from '@/widgets/audio-editor';

import { TrackEditorRightPaneProps } from './interfaces';

let currentEditableTrackId: string | undefined = undefined;

export const TrackEditorRightPane = observer(function TrackEditorRightPane({
  className,
  ...props
}: TrackEditorRightPaneProps) {
  const audioEditor = useAudioEditor();
  const player = usePlayer();

  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimelineInitialize('track-editor', {
    timelineRef,
    startTime: audioEditor.editableTrack?.isTrimming
      ? audioEditor.editableTrack.startTime
      : audioEditor.editableTrack?.trimStartTime,
    endTime: audioEditor.editableTrack?.trimEndTime ?? 0,
    trackHeight: '100%',
  });

  const waveformComponent = useMemo(
    () =>
      !audioEditor.editableTrack ? null : (
        <TrackWaveform track={audioEditor.editableTrack} ignoreSelection />
      ),
    [audioEditor.editableTrack],
  );

  const handleTimeSeek = useHandleTimeSeek(player, timeline);

  const { onMouseDown, onClick } = useIsMouseClickStartsOnThisSpecificElement();
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClick?.(e)) {
        return;
      }

      handleTimeSeek(e);
    },
    [handleTimeSeek, onClick],
  );

  useTimelineWheelHandler(timelineRef, timeline);

  useEffect(() => {
    if (audioEditor.editableTrack?.id !== currentEditableTrackId) {
      timeline.zoom = 0;
      currentEditableTrackId = audioEditor.editableTrack?.id;
    }
  }, [audioEditor.editableTrack, timeline]);

  return (
    <TimelineContext.Provider value={timeline}>
      <div className={cn('flex flex-col', className)} {...props}>
        <TimelineHeader className='h-16 min-h-16' centerLine={false} />
        <div className='flex size-full flex-col overflow-hidden'>
          <div
            className='size-full grow overflow-x-hidden'
            ref={timelineRef}
            onClick={handleClick}
            onMouseDown={onMouseDown}
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
