/* eslint-disable sonarjs/no-duplicate-string */
'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn, useGlobalMouseMove, useTimeLoop } from '@/shared/lib';

import {
  AudioEditorManager,
  AudioEditorTimelineState,
  AudioEditorTimelineStateContext,
} from '@/entities/audio-editor';
import {
  Channel,
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';
import { ClockRef } from '@/entities/clock';
import { GlobalControlsEvent, useGlobalControls } from '@/entities/event';
import { PlaylistInfoMemoized } from '@/entities/playlist';
import { useTracks } from '@/entities/track';

import { AudioEditorFloatingToolbarMemoized } from '@/features/audio-editor-floating-toolbar';
import {
  TimelineRulerMemoized,
  TimelineRulerRef,
  TimelineGridRef,
  TimelineGridMemoized,
  clampTime,
  TimelineScrollMemoized,
  TimelineScrollDivRef,
  TimelinePlayHeadMemoized,
} from '@/features/timeline';

import {
  useAudioEditorTimelineRulerAndGrid,
  useAudioEditorViewProperties,
} from '../../lib';
import { AudioEditorChannelsList } from '../AudioEditorChannelsList';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';
import { AudioEditorTracksList } from '../AudioEditorTracksList';

import { TimelineProps } from './interfaces';

const trackHeight = 96;
const rulerLeftPadding = 5;
const sidebarWidth = 296;

const timelineLeftPadding = rulerLeftPadding;
const startPageX = sidebarWidth;

const predefinedChannels = [new Channel(), new Channel()];

export const AudioEditor = observer(function AudioEditor({
  playlist,
  className,
  ...props
}: TimelineProps) {
  const [audioEditorTimelineState] = useState(
    () => new AudioEditorTimelineState(),
  );

  const [audioEditorManager] = useState(
    () => new AudioEditorManager(predefinedChannels),
  );

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const clockRef = useRef<ClockRef | null>(null);
  const playHeadRef = useRef<HTMLDivElement | null>(null);
  const rulerRef = useRef<TimelineRulerRef | null>(null);
  const gridRef = useRef<TimelineGridRef | null>(null);
  const horizontalScrollRef = useRef<TimelineScrollDivRef>(null);

  const playingRef = useRef(audioEditorManager.isPlaying);

  const { tracks, loadedTracksCount } = useTracks(playlist);

  useEffect(() => {
    const channelIds = [...audioEditorManager.channels.values()].map(
      (channel) => channel.id,
    );

    audioEditorManager.clearTracks();

    playlist.tracks.forEach((track, i) =>
      audioEditorManager.channels
        .get(i % 2 === 0 ? channelIds[0] : channelIds[1])
        ?.importTrack(track),
    );
  }, [audioEditorManager, playlist.tracks]);

  const handleZoomScrollChange = (
    zoom: number,
    scroll: number,
    pixelsPerSecond: number,
  ) => {
    audioEditorTimelineState.setProperties({ zoom, scroll, pixelsPerSecond });
    updateTicks(zoom, scroll, pixelsPerSecond);
    updateTimelineRulerAndGrid(zoom, scroll, pixelsPerSecond);
    updatePlayHead();
  };

  const handleScrollChange = (scroll: number) => {
    updateHorizontalScrollbar(scroll);
  };

  const {
    zoomRef,
    scrollRef,
    setScroll,
    timelineClientWidth,
    timelineScrollWidth,
    pixelsPerSecond,
  } = useAudioEditorViewProperties({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    playlistTotalTime: playlist.duration_in_seconds,
    onScrollChange: handleScrollChange,
    onChange: handleZoomScrollChange,
  });

  const realToVirtualPixels = useCallback(
    (value: number) => {
      return (
        value * pixelsPerSecond - timelineLeftPadding - (scrollRef.current ?? 0)
      );
    },
    [pixelsPerSecond, scrollRef],
  );

  const virtualToRealPixels = useCallback(
    (value: number) => {
      return (
        (value - timelineLeftPadding) / pixelsPerSecond +
        (scrollRef.current ?? 0)
      );
    },
    [pixelsPerSecond, scrollRef],
  );

  const { renderGrid, renderRuler, updateTicks } =
    useAudioEditorTimelineRulerAndGrid({
      rulerRef,
      gridRef,
      timelineClientWidth,
      timelineLeftPadding,
    });

  const updateTimelineRulerAndGrid = useCallback(
    (zoom: number, scroll: number, pixelsPerSecond: number) => {
      renderRuler(zoom, scroll, pixelsPerSecond);
      renderGrid(scroll, pixelsPerSecond);
    },
    [renderGrid, renderRuler],
  );

  const updateClock = useCallback(() => {
    clockRef.current?.updateTime(audioEditorManager.time);
  }, [audioEditorManager.time]);

  //#region Play head positioning
  const getPlayHeadPosition = useCallback(() => {
    return (
      realToVirtualPixels(audioEditorManager.time) -
      realToVirtualPixels(scrollRef.current ?? 0) +
      timelineLeftPadding
    );
  }, [audioEditorManager.time, realToVirtualPixels, scrollRef]);

  const setViewToPlayHead = useCallback(
    (timelineClientWidth: number, shift: number, pixelsPerSecond: number) => {
      const virtualShift = realToVirtualPixels(shift);
      const playHeadVirtualPosition =
        realToVirtualPixels(audioEditorManager.time) + timelineLeftPadding;

      if (
        playHeadVirtualPosition < virtualShift ||
        playHeadVirtualPosition >= timelineClientWidth + virtualShift
      ) {
        setScroll(playHeadVirtualPosition / pixelsPerSecond);
      }
    },
    [audioEditorManager.time, realToVirtualPixels, setScroll],
  );

  const updatePlayHead = useCallback(() => {
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    const newPosition = getPlayHeadPosition();

    playHead.style.left = `${newPosition}px`;

    if (playingRef.current) {
      setViewToPlayHead(
        timelineClientWidth,
        scrollRef.current ?? 0,
        pixelsPerSecond,
      );
    }

    playHead.style.display =
      newPosition < 0 || newPosition > timelineClientWidth ? 'none' : '';
  }, [
    getPlayHeadPosition,
    pixelsPerSecond,
    scrollRef,
    setViewToPlayHead,
    timelineClientWidth,
  ]);
  //#endregion

  const updateTimeDependent = useCallback(() => {
    updatePlayHead();
    updateClock();
  }, [updateClock, updatePlayHead]);

  const onTimeUpdate = useCallback(
    (delta: number) => {
      audioEditorManager.time += delta / 1000;
      audioEditorManager.updateAudioBuffer();

      updateTimeDependent();
    },
    [audioEditorManager, updateTimeDependent],
  );

  //#region Handle play head mouse move
  const handleMouseMovePlayHead = useCallback(
    (e: MouseEvent) => {
      audioEditorManager.seekTo(
        clampTime(virtualToRealPixels(e.pageX - startPageX)),
      );

      requestAnimationFrame(updateTimeDependent);
    },
    [audioEditorManager, updateTimeDependent, virtualToRealPixels],
  );

  const handleClickPlayHead = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      audioEditorManager.seekTo(
        clampTime(virtualToRealPixels(e.nativeEvent.pageX - startPageX)),
      );

      updateTimeDependent();
    },
    [audioEditorManager, updateTimeDependent, virtualToRealPixels],
  );
  //#endregion

  const handleClickTimeline = () => {
    audioEditorManager.setSelectedTrack(null);
  };

  //#region Horizontal scrollbar
  const updateHorizontalScrollbar = useCallback(
    (scroll: number) => {
      horizontalScrollRef.current?.setScroll(scroll * pixelsPerSecond);
    },
    [pixelsPerSecond],
  );

  const handleHorizontalScrollbarOnScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScroll(e.currentTarget.scrollLeft / pixelsPerSecond);
    },
    [pixelsPerSecond, setScroll],
  );
  //#endregion

  const handleGlobalControls = useCallback(
    (event: GlobalControlsEvent) => {
      if (event.type === 'Play/Pause') {
        if (audioEditorManager.isPlaying) {
          audioEditorManager.stop();
        } else {
          audioEditorManager.play();
        }
      }
    },
    [audioEditorManager],
  );

  //#region Setup observer hooks
  useTimeLoop({
    isRunning: audioEditorManager.isPlaying,
    onUpdate: onTimeUpdate,
  });
  useGlobalMouseMove(handleMouseMovePlayHead, rulerWrapperRef);
  useGlobalControls(handleGlobalControls);
  //#endregion

  //#region Setup state
  useEffect(() => {
    audioEditorTimelineState.setBounds(startPageX, timelineClientWidth);
    audioEditorTimelineState.setTimelineLeftPadding(timelineLeftPadding);
  }, [audioEditorTimelineState, timelineClientWidth]);
  //#endregion

  //#region Initial render
  useEffect(() => {
    if (!zoomRef.current || !scrollRef.current) {
      return;
    }

    updateTimelineRulerAndGrid(
      zoomRef.current,
      scrollRef.current,
      pixelsPerSecond,
    );
  }, [pixelsPerSecond, updateTimelineRulerAndGrid, scrollRef, zoomRef]);

  useEffect(() => {
    updateTimeDependent();
  }, [updateTimeDependent]);
  //#endregion

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <AudioEditorHeaderMemoized
        className='border-b border-b-secondary px-6 py-3'
        clockRef={clockRef}
        audioEditorManager={audioEditorManager}
      />
      <div className='relative flex h-full grow flex-col overflow-hidden'>
        <div className='flex'>
          <div className='pointer-events-none absolute left-[296px] z-20 h-full'>
            <TimelinePlayHeadMemoized
              ref={playHeadRef}
              initialPosition={timelineLeftPadding}
            />
          </div>
          <ChannelListMemoized className='min-w-[296px]'>
            <ChannelListItemMemoized
              className='h-[72px] items-start'
              disableBorder
            >
              <PlaylistInfoMemoized
                totalPlaytime={playlist.duration_in_seconds}
                tracksCount={playlist.tracks.length}
              />
            </ChannelListItemMemoized>
          </ChannelListMemoized>
          <div
            className='relative flex w-full items-end pb-[9px]'
            onClick={handleClickPlayHead}
            ref={rulerWrapperRef}
          >
            <TimelineRulerMemoized className='h-[32px] w-full' ref={rulerRef} />
          </div>
        </div>
        <hr className='border-secondary' />
        <div className='flex h-full grow overflow-y-auto overflow-x-hidden'>
          <AudioEditorChannelsList
            className='min-h-max min-w-[296px] grow'
            audioEditorManager={audioEditorManager}
            trackHeight={trackHeight}
          />
          <div
            className='relative min-h-max w-full grow overflow-x-clip'
            ref={timelineRef}
            onMouseUp={handleClickPlayHead}
            onClick={handleClickTimeline}
          >
            {tracks === null ? (
              <span className='flex size-full flex-col items-center justify-center'>
                <span>{'Loading...'}</span>
                <span>{`${loadedTracksCount} / ${playlist.tracks.length}`}</span>
              </span>
            ) : (
              <>
                <TimelineGridMemoized
                  className='absolute w-full'
                  height={audioEditorManager.channels.size * trackHeight}
                  ref={gridRef}
                />
                <AudioEditorTimelineStateContext.Provider
                  value={audioEditorTimelineState}
                >
                  <AudioEditorTracksList
                    audioEditorManager={audioEditorManager}
                    tracksData={tracks}
                  />
                </AudioEditorTimelineStateContext.Provider>
              </>
            )}
            <AudioEditorFloatingToolbarMemoized className='absolute inset-x-0 bottom-[40px] z-30 mx-auto flex w-max' />
          </div>
        </div>
      </div>
      <div className='grid grow grid-cols-[296px_auto]'>
        <TimelineScrollMemoized
          className='col-start-2'
          scrollDivRef={horizontalScrollRef}
          timelineScrollWidth={timelineScrollWidth}
          xPadding={4}
          onChange={handleHorizontalScrollbarOnScroll}
        />
      </div>
    </div>
  );
});
