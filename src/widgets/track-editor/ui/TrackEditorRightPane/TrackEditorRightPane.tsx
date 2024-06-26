'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  TimelineControllerContext,
  usePlayer,
  useHandleTimeSeek,
} from '@/entities/audio-editor';
import { FadeOverlay, TrackWaveform, TrimMarker } from '@/entities/track';

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
  const player = usePlayer();

  const rulerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerRef,
    startTime: player.editableTrack?.isTrimming
      ? player.editableTrack.startTime
      : player.editableTrack?.trimStartTime,
    duration: player.editableTrack?.duration ?? 0,
  });

  const waveformComponent = useMemo(
    () =>
      !player.editableTrack ? (
        <></>
      ) : (
        <TrackWaveform
          player={player}
          track={player.editableTrack}
          ignoreSelection
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [player.editableTrack],
  );

  const handleTimeSeek = useHandleTimeSeek(player, timelineController);

  useEffect(() => {
    if (!player.editableTrack) {
      return;
    }

    if (
      player.editableTrack.isTrimming &&
      timelineController.scroll > player.editableTrack.trimStartTime
    ) {
      timelineController.scroll = player.editableTrack.trimStartTime;
    }
  }, [
    player.editableTrack,
    player.editableTrack?.isTrimming,
    player.editableTrack?.trimStartTime,
    timelineController,
  ]);

  useEffect(() => {
    if (!player.editableTrack) {
      return;
    }

    timelineController.scroll = player.editableTrack.trimStartTime;
  }, [player.editableTrack, timelineController]);

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
            {!player.editableTrack ? null : (
              <ChannelListItemView
                className='relative size-full'
                player={player}
                channel={player.editableTrack?.channel}
                ignoreSelection
                disableBorder
              >
                <AudioEditorTrackView
                  className='h-[calc(100%-14px)]'
                  key={`track-${player.editableTrack.uuid}-editable`}
                  track={player.editableTrack}
                  player={player}
                  waveformComponent={waveformComponent}
                  disableInteractive
                  hideTitle
                >
                  <TrimMarker
                    className='absolute bottom-0 left-0 z-20'
                    side='left'
                    track={player.editableTrack}
                  />
                  <TrimMarker
                    className='absolute bottom-0 right-0 z-20'
                    side='right'
                    track={player.editableTrack}
                  />
                  <FadeOverlay
                    className='absolute top-0 z-20'
                    side='left'
                    track={player.editableTrack}
                  />
                  <FadeOverlay
                    className='absolute top-0 z-20'
                    side='right'
                    track={player.editableTrack}
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
