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
  TimelineSlider,
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
  TimelinePlayHeadRef,
} from '@/features/timeline';
import { TrackChannelControlMemoized } from '@/features/track-channel-control';
import { TrackFloatingMenuMemoized } from '@/features/track-floating-menu';
import { ClockRef, TrackInfoPanelMemoized } from '@/features/track-info-panel';

import { TimelineProps } from './interfaces';

const ticksStartPadding = 5;

export const Timeline = ({ playlist, className, ...props }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rulerRef = useRef<TimelineRulerRef | null>(null);
  const gridRef = useRef<TimelineGridRef | null>(null);
  const clockRef = useRef<ClockRef | null>(null);
  const playHeadRef = useRef<TimelinePlayHeadRef | null>(null);

  const [channels, setChannels] = useState<{ id: number }[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const playingRef = useRef(isPlaying);

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

  const { zoom, shift, setShift, pixelsPerSecond, timelineScrollWidth } =
    useTimelineProperties(
      timelineRef,
      containerRef,
      timelineClientWidth,
      playlistTotalTime,
      50,
      paddingTimeSeconds,
    );

  const ticks = useTicks(timelineScrollWidth, zoom, shift * pixelsPerSecond);

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

      const shiftFromLeft =
        ticksStartPadding + trackStartPosition - shiftPixels;
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
            display: isVisible ? 'flex' : 'none',
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

  const updatePlayHeadAndTime = useCallback(() => {
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

    playHeadRef.current?.updatePosition(
      time.current,
      shift,
      pixelsPerSecond,
      timelineClientWidth,
    );

    clockRef.current?.updateTime(time.current);
  }, [
    pixelsPerSecond,
    shift,
    timelineClientWidth,
    isPlaying,
    getIntersectingByTimeTracks,
  ]);

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
      requestAnimationFrame(animatePlayHead);
    },
    [updatePlayHeadAndTime],
  );

  const handlePlay = () => {
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
  ) => rulerRef.current?.render(ticks, shift, ticksStartPadding, '#9B9B9B');

  const renderGrid = (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    shift: number,
    ticksStartPadding: number,
  ) =>
    gridRef.current?.render(
      ticks,
      shift,
      ticksStartPadding,
      '#555555',
      '#2D2D2D',
    );

  const handleMouseMovePlayHead = useCallback(
    (e: MouseEvent) => {
      time.current = clampTime(
        (e.pageX - ticksStartPadding - 294) / pixelsPerSecond + shift,
      );

      requestAnimationFrame(updatePlayHeadAndTime);
    },
    [pixelsPerSecond, shift, updatePlayHeadAndTime],
  );

  const handleClickPlayHead = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      time.current = clampTime(
        (e.pageX - ticksStartPadding - 294) / pixelsPerSecond + shift,
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
    [pixelsPerSecond, shift, updatePlayHeadAndTime, isPlaying, playlist.tracks],
  );

  useEffect(() => {
    const animationId = requestAnimationFrame(animatePlayHead);

    if (!isPlaying) {
      window.cancelAnimationFrame(animationId);
    }

    return () => window.cancelAnimationFrame(animationId);
  }, [animatePlayHead, isPlaying]);

  useEffect(() => {
    updatePlayHeadAndTime();
  }, [updatePlayHeadAndTime]);

  useEffect(() => {
    renderRuler(ticks, shift * pixelsPerSecond, ticksStartPadding);
  }, [ticks, channels, timelineClientWidth, shift, pixelsPerSecond]);

  useEffect(() => {
    renderGrid(ticks, shift * pixelsPerSecond, ticksStartPadding);
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
      <div className='relative flex h-full grow flex-col'>
        <div className='flex'>
          <div className='pointer-events-none absolute left-[296px] z-10 h-full'>
            <TimelinePlayHead
              ref={playHeadRef}
              leftPadding={ticksStartPadding}
            />
          </div>
          <TrackSidebarMemoized className='min-w-[296px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfoMemoized
                totalPlaytime={playlistTotalTime}
                tracksCount={playlist.tracks.length}
              />
            </TrackSidebarItem>
          </TrackSidebarMemoized>
          <div
            className='flex w-full items-center'
            onClick={handleClickPlayHead}
            ref={containerRef}
          >
            <TimelineRulerMemoized className='h-[30px] w-full' ref={rulerRef} />
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
                <TrackSidebarItemMemoized className='relative'>
                  {evenTracks}
                </TrackSidebarItemMemoized>
                <TrackSidebarItemMemoized className='relative'>
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
        <div className='w-full px-2'>
          <TimelineSlider
            className='w-full'
            zoom={zoom}
            value={shift}
            realWidth={
              timelineScrollWidth - paddingTimeSeconds * pixelsPerSecond
            }
            max={
              timelineScrollWidth / pixelsPerSecond -
              timelineClientWidth / pixelsPerSecond +
              paddingTimeSeconds
            }
            onChange={(e) => setShift(Number(e.currentTarget.value))}
          />
          <TrackFloatingMenuMemoized
            className='absolute bottom-[40px] left-[296px] right-0 z-20 mx-auto flex w-max
          '
          />
        </div>
      </div>
    </div>
  );
};
