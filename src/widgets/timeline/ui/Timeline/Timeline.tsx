'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useSize, cn } from '@/shared/lib';

import {
  AddNewChannelButtonMemoized,
  PlaylistInfoMemoized,
  Track,
  TrackSidebarItem,
  TrackSidebarItemMemoized,
  TrackSidebarMemoized,
  TrackWaveformCardMemoized,
  getPlaylistMaxTime,
  useTracks,
} from '@/entities/track';

import {
  useTimelineProperties,
  TimelineRulerMemoized,
  TimelineRulerRef,
  TimelineGridRef,
  TimelineGridMemoized,
  Tick,
  useTicks,
  TimelinePlayHead,
  usePlayHeadMove,
  clampTime,
  TimelineSliderMemoized,
} from '@/features/timeline';
import { TrackChannelControlMemoized } from '@/features/track-channel-control';
import { TrackFloatingMenuMemoized } from '@/features/track-floating-menu';
import { ClockRef, TrackInfoPanelMemoized } from '@/features/track-info-panel';

import { TimelineProps } from './interfaces';

const rulerLeftPadding = 5;

export const Timeline = ({ playlist, className, ...props }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rulerRef = useRef<TimelineRulerRef | null>(null);
  const gridRef = useRef<TimelineGridRef | null>(null);
  const clockRef = useRef<ClockRef | null>(null);

  const playHeadRef = useRef<HTMLDivElement | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [channels, setChannels] = useState<{ id: number }[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const playingRef = useRef(isPlaying);

  const timeAnimationFrame = useRef<number>(0);

  const size = useSize(containerRef);
  const timelineClientWidth = size?.width ?? 0;
  const paddingTimeSeconds = 120;

  const tracksBuffers = useRef<{
    [key: number]: WaveSurfer;
  }>({});

  const onAppendTrackBuffer = (trackId: number, trackBuffer: WaveSurfer) =>
    (tracksBuffers.current = {
      ...tracksBuffers.current,
      [trackId]: trackBuffer,
    });

  const playlistTotalTime = useMemo(
    () => getPlaylistMaxTime(playlist),
    [playlist],
  );
  const { tracks, loadedTracksCount } = useTracks(playlist);
  const isReady = tracks !== null;

  const handleShiftChange = useCallback((newShift: number) => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.dataset.synthetic = 'true';
    scrollRef.current.scrollLeft = newShift;
  }, []);

  const { zoom, shift, setShift, pixelsPerSecond, timelineScrollWidth } =
    useTimelineProperties(
      timelineRef,
      containerRef,
      timelineClientWidth,
      playlistTotalTime,
      50,
      paddingTimeSeconds,
      handleShiftChange,
    );

  const setAllShift = useCallback(
    (newShift: number) => {
      setShift(newShift);
      handleShiftChange(newShift);
    },
    [handleShiftChange, setShift],
  );

  const ticks = useTicks(timelineClientWidth, zoom, shift * pixelsPerSecond);

  const addNewChannel = () => {
    setChannels((prevState) => [
      ...prevState,
      { id: (prevState.at(-1)?.id ?? 0) + 1 },
    ]);
  };

  const trackNodes = useMemo(
    () =>
      channels.map((channel) => (
        <TrackSidebarItemMemoized
          key={`${channel.id}-track`}
          className='relative'
        />
      )),
    [channels],
  );

  const trackMapFunction = useCallback(
    (track: Track) => {
      const durationInSeconds = track.end - track.start;

      const trackStartPosition = track.start * pixelsPerSecond;
      const trackEndPosition = track.end * pixelsPerSecond;

      const shiftPixels = shift * pixelsPerSecond;

      const shiftFromLeft = rulerLeftPadding + trackStartPosition - shiftPixels;
      const trackWidth = durationInSeconds * pixelsPerSecond;

      const isVisible =
        trackStartPosition < timelineClientWidth + shiftPixels &&
        trackEndPosition > shiftPixels;

      return (
        <TrackWaveformCardMemoized
          className='absolute'
          key={track.uuid}
          track={track}
          trackData={tracks?.[track.uuid]}
          style={{
            display: isVisible ? '' : 'none',
            width: trackWidth,
            left: shiftFromLeft,
          }}
          onAddTrackBuffer={onAppendTrackBuffer}
        />
      );
    },
    [pixelsPerSecond, shift, timelineClientWidth, tracks],
  );

  const { evenTracks, oddTracks } = useMemo(
    () => ({
      evenTracks: playlist.tracks
        .filter((_, i) => i % 2 === 0)
        .map(trackMapFunction),
      oddTracks: playlist.tracks
        .filter((_, i) => i % 2 !== 0)
        .map(trackMapFunction),
    }),
    [playlist.tracks, trackMapFunction],
  );

  const time = useRef<number>(0);
  const startRef = useRef<number | undefined>(undefined);
  const prevRef = useRef<number>(0);

  const getIntersectingByTimeTracks = useCallback(
    (time: number) =>
      playlist.tracks.filter(({ start, end }) => time >= start && time < end),
    [playlist.tracks],
  );

  const getTrackBuffer = (trackId: number) => tracksBuffers.current[trackId];

  const updateTrackBuffers = useCallback(() => {
    if (!isReady) {
      return;
    }

    const tracks = getIntersectingByTimeTracks(time.current);

    // TODO: тут надо как-то оптимизировать это, жесткая долбёжка: https://www.youtube.com/watch?v=szMd_uh8xtc
    if (isPlaying && tracks.length > 0) {
      tracks.forEach(({ id }) => {
        const trackBuffer = getTrackBuffer(id);

        if (trackBuffer && !trackBuffer.isPlaying()) {
          trackBuffer.play();
        }
      });
    }
  }, [getIntersectingByTimeTracks, isPlaying, isReady]);

  const realToVirtualPixels = useCallback(
    (value: number) => {
      return value * pixelsPerSecond;
    },
    [pixelsPerSecond],
  );

  const getPlayHeadPosition = useCallback(() => {
    return (
      realToVirtualPixels(time.current) -
      realToVirtualPixels(shift) +
      rulerLeftPadding
    );
  }, [realToVirtualPixels, shift]);

  const setViewToPlayHead = useCallback(
    (timelineClientWidth: number, shift: number, pixelsPerSecond: number) => {
      const playHeadVirtualPosition =
        realToVirtualPixels(time.current) + rulerLeftPadding;
      const virtualShift = realToVirtualPixels(shift);

      if (
        playHeadVirtualPosition < virtualShift ||
        playHeadVirtualPosition >= timelineClientWidth + virtualShift
      ) {
        setAllShift(playHeadVirtualPosition / pixelsPerSecond);
      }
    },
    [realToVirtualPixels, setAllShift],
  );

  const updatePlayHead = useCallback(() => {
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    const newPosition = getPlayHeadPosition();

    playHead.style.left = `${newPosition}px`;

    if (playingRef.current) {
      setViewToPlayHead(timelineClientWidth, shift, pixelsPerSecond);
    }

    playHead.style.display =
      newPosition < 0 || newPosition > timelineClientWidth ? 'none' : '';
  }, [
    getPlayHeadPosition,
    pixelsPerSecond,
    setViewToPlayHead,
    shift,
    timelineClientWidth,
  ]);

  const updateClock = () => {
    clockRef.current?.updateTime(time.current);
  };

  const updatePlayHeadAndTime = useCallback(() => {
    updateTrackBuffers();
    updatePlayHead();
    updateClock();
  }, [updatePlayHead, updateTrackBuffers]);

  const animatePlayHead = useCallback(
    (timeStamp: number) => {
      const playing = playingRef.current;

      if (!playing) {
        startRef.current = undefined;
        prevRef.current = 0;
        return;
      }

      if (startRef.current === undefined) {
        startRef.current = timeStamp;
        prevRef.current = timeStamp;
      }

      time.current += 1 * ((timeStamp - prevRef.current) / 1000);

      updatePlayHeadAndTime();

      prevRef.current = timeStamp;
      timeAnimationFrame.current = requestAnimationFrame(animatePlayHead);
    },
    [updatePlayHeadAndTime],
  );

  const handlePlay = () => {
    // if (!isReady) {
    //   return;
    // }

    setIsPlaying(true);
    playingRef.current = true;

    const tracks = getIntersectingByTimeTracks(time.current);

    if (tracks.length === 0) {
      return;
    }

    tracks.forEach(({ start, end, id }) => {
      const trackSeekPercent = (time.current - start) / (end - start);

      const trackBuffer = getTrackBuffer(id);
      trackBuffer.seekTo(trackSeekPercent);
      trackBuffer.play();
    });
  };

  const handleStop = () => {
    setIsPlaying(false);
    playingRef.current = false;
    startRef.current = undefined;

    const tracks = Object.values(tracksBuffers.current);

    if (tracks.length === 0) {
      return;
    }

    tracks.forEach((track) => track.pause());
  };

  const renderRuler = (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    shift: number,
    ticksStartPadding: number,
    zoom: number,
  ) =>
    requestAnimationFrame(() => {
      rulerRef.current?.render(
        ticks,
        shift,
        ticksStartPadding,
        zoom,
        '#9B9B9B',
      );
    });

  const renderGrid = (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    shift: number,
    ticksStartPadding: number,
  ) =>
    requestAnimationFrame(() => {
      gridRef.current?.render(
        ticks,
        shift,
        ticksStartPadding,
        '#555555',
        '#2D2D2D',
      );
    });

  const handleMouseMovePlayHead = useCallback(
    (e: MouseEvent) => {
      time.current = clampTime(
        (e.pageX - rulerLeftPadding - 294) / pixelsPerSecond + shift,
      );

      requestAnimationFrame(updatePlayHeadAndTime);
    },
    [pixelsPerSecond, shift, updatePlayHeadAndTime],
  );

  const handleClickPlayHead = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      time.current = clampTime(
        (e.pageX - rulerLeftPadding - 294) / pixelsPerSecond + shift,
      );

      if (isPlaying) {
        handleStop();
        handlePlay();
      } else {
        handleStop();
      }

      const tracksIds = {
        filled: [] as number[],
        empty: [] as number[],
      };

      playlist.tracks.forEach(({ start, end, id }) => {
        if (start >= time.current) {
          tracksIds.empty.push(id);
        } else if (time.current >= end) {
          tracksIds.filled.push(id);
        }
      });

      tracksIds.filled.forEach((id) => {
        const trackBuffer = getTrackBuffer(id);

        if (trackBuffer) {
          trackBuffer.seekTo(1);
        }
      });

      tracksIds.empty.forEach((id) => {
        const trackBuffer = getTrackBuffer(id);

        if (trackBuffer) {
          trackBuffer.seekTo(0);
        }
      });

      updatePlayHeadAndTime();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pixelsPerSecond, shift, updatePlayHeadAndTime, isPlaying, playlist.tracks],
  );

  useEffect(() => {
    const animationId = requestAnimationFrame(animatePlayHead);
    timeAnimationFrame.current = animationId;

    if (!isPlaying) {
      window.cancelAnimationFrame(animationId);
      window.cancelAnimationFrame(timeAnimationFrame.current);
    }

    return () => {
      window.cancelAnimationFrame(animationId);
      window.cancelAnimationFrame(timeAnimationFrame.current);
    };
  }, [animatePlayHead, isPlaying]);

  useEffect(() => {
    updatePlayHeadAndTime();
  }, [updatePlayHeadAndTime]);

  useEffect(() => {
    renderRuler(ticks, shift * pixelsPerSecond, rulerLeftPadding, zoom);
  }, [ticks, channels, timelineClientWidth, shift, pixelsPerSecond, zoom]);

  useEffect(() => {
    renderGrid(ticks, shift * pixelsPerSecond, rulerLeftPadding);
  }, [
    ticks,
    channels,
    timelineClientWidth,
    shift,
    pixelsPerSecond,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.keys(tracks ?? {}),
  ]);

  usePlayHeadMove(handleMouseMovePlayHead, containerRef);

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <TrackInfoPanelMemoized
        className='px-6 py-3'
        playing={isPlaying}
        onPlay={handlePlay}
        onStop={handleStop}
        clockRef={clockRef}
      />
      <hr className='border-secondary' />
      <div className='relative flex h-full grow flex-col overflow-hidden'>
        <div className='flex'>
          <div className='pointer-events-none absolute left-[296px] z-10 h-full'>
            <TimelinePlayHead
              ref={playHeadRef}
              style={{ left: rulerLeftPadding }}
            />
          </div>
          <TrackSidebarMemoized className='min-w-[296px]'>
            <TrackSidebarItem className='h-[72px] items-start' disableBorder>
              <PlaylistInfoMemoized
                totalPlaytime={playlistTotalTime}
                tracksCount={playlist.tracks.length}
              />
            </TrackSidebarItem>
          </TrackSidebarMemoized>
          <div
            className='relative flex w-full items-end pb-[9px]'
            onClick={handleClickPlayHead}
            ref={containerRef}
          >
            <TimelineRulerMemoized className='h-[32px] w-full' ref={rulerRef} />
          </div>
        </div>
        <hr className='border-secondary' />
        <div className='flex h-full grow overflow-auto'>
          <div className='min-h-max min-w-[296px] grow'>
            <TrackSidebarMemoized className='min-h-full'>
              <TrackSidebarItemMemoized>
                <TrackChannelControlMemoized
                  number={1}
                  onClickRemove={() =>
                    setChannels((prevState) => [
                      ...prevState.slice(0, prevState.length - 1),
                    ])
                  }
                />
              </TrackSidebarItemMemoized>
              <TrackSidebarItemMemoized>
                <TrackChannelControlMemoized
                  number={2}
                  onClickRemove={() =>
                    setChannels((prevState) => [
                      ...prevState.slice(0, prevState.length - 1),
                    ])
                  }
                />
              </TrackSidebarItemMemoized>
              {channels.map((channel, index) => (
                <TrackSidebarItemMemoized key={`${channel.id}-channel`}>
                  <TrackChannelControlMemoized
                    number={index + 3}
                    isAbleToRemove
                    onClickRemove={() =>
                      setChannels((prevState) => [
                        ...prevState.slice(0, prevState.length - 1),
                      ])
                    }
                  />
                </TrackSidebarItemMemoized>
              ))}
              <TrackSidebarItemMemoized
                className='justify-center'
                disableBorder
              >
                <AddNewChannelButtonMemoized onClick={addNewChannel} />
              </TrackSidebarItemMemoized>
            </TrackSidebarMemoized>
          </div>

          <div
            className='relative min-h-max w-full grow overflow-hidden'
            ref={timelineRef}
            onMouseUp={handleClickPlayHead}
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
                  style={{ height: (channels.length + 2) * 96 }}
                  ref={gridRef}
                />
                <TrackSidebarItemMemoized className='relative p-0'>
                  {evenTracks}
                </TrackSidebarItemMemoized>
                <TrackSidebarItemMemoized className='relative p-0'>
                  {oddTracks}
                </TrackSidebarItemMemoized>
                {trackNodes}
              </>
            )}
          </div>
        </div>
      </div>
      <div className='relative flex grow'>
        <div className='min-w-[296px]' />
        <TimelineSliderMemoized
          ref={scrollRef}
          timelineScrollWidth={timelineScrollWidth}
          xPadding={8}
          onScroll={(e) => {
            if (e.currentTarget.dataset.synthetic) {
              e.currentTarget.dataset.synthetic = '';
              return;
            }

            setShift(e.currentTarget.scrollLeft);
          }}
        />
        <TrackFloatingMenuMemoized className='absolute bottom-[40px] left-[296px] right-0 z-20 mx-auto flex w-max' />
      </div>
    </div>
  );
};
