'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  getTrack,
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
  getDpi,
} from '@/features/timeline';
import { TrackChannelControlMemoized } from '@/features/track-channel-control';
import { TrackFloatingMenuMemoized } from '@/features/track-floating-menu';
import { TrackInfoPanelMemoized } from '@/features/track-info-panel';

import { TimelineProps } from './interfaces';

const ticksStartPadding = 5;

export const Timeline = ({ playlist, className, ...props }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rulerRef = useRef<TimelineRulerRef | null>(null);
  const gridRef = useRef<TimelineGridRef | null>(null);

  const [tracks, setTracks] = useState<Record<string, Blob | undefined> | null>(
    null,
  );

  const [loadedTracksCount, setLoadedTracksCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (process.env.NEXT_PUBLIC_DEBUG_LOAD_TRACKS === 'false') {
      setTracks({});
      return;
    }

    const updateTracks = async () => {
      const getBlobBoundByUuid = async (uuid: string) => [
        uuid,
        (await getTrack(uuid)).data,
      ];

      const blobs = await Promise.all(
        playlist.tracks.map((track) =>
          getBlobBoundByUuid(track.uuid).then((res) => {
            setLoadedTracksCount((prevState) => prevState + 1);
            return res;
          }),
        ),
      );

      setTracks(Object.fromEntries(blobs));
    };

    updateTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(playlist.tracks.map((track) => track.uuid))]);

  const [isPlaying, setIsPlaying] = useState(false);

  const playlistTotalTime = getPlaylistMaxTime(playlist);

  const _size = useSize(containerRef);
  const width = _size?.width ?? 0;

  const { zoom, shift, setShift, pixelsPerSecond, realWidth } =
    useTimelineProperties(timelineRef, width, playlistTotalTime, 100);

  const dpi = useMemo(() => getDpi(), []);
  // const ticks = useTicks(realWidth * dpi, zoom, shift);

  const [channels, setChannels] = useState<{ id: number }[]>([]);

  const addNewChannel = () => {
    setChannels((prevState) => [
      ...prevState,
      { id: (prevState.at(-1)?.id ?? 0) + 1 },
    ]);
  };

  const trackMapFunction = (track: Track) => {
    const durationInSeconds = track.end - track.start;

    const trackStartPosition = track.start * pixelsPerSecond;
    const trackEndPosition = track.end * pixelsPerSecond;

    const shiftPixels = shift * pixelsPerSecond;

    const shiftFromLeft = ticksStartPadding + trackStartPosition - shiftPixels;
    const trackWidth = durationInSeconds * pixelsPerSecond;

    const isVisible =
      trackStartPosition < width + shiftPixels &&
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
      />
    );
  };

  const { evenTracks, oddTracks } = useMemo(
    () => ({
      evenTracks: playlist.tracks
        .filter((_, i) => i % 2 === 0)
        .map(trackMapFunction),
      oddTracks: playlist.tracks
        .filter((_, i) => i % 2 !== 0)
        .map(trackMapFunction),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playlist.tracks, shift, pixelsPerSecond, width, tracks],
  );

  const playHeadRef = useRef<HTMLDivElement | null>(null);
  const time = useRef<number>(0);
  const startRef = useRef<number | undefined>(undefined);
  const prevRef = useRef<number>(0);

  const calculateTrack = () => {
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }
    const newPosition =
      time.current * pixelsPerSecond - shift + ticksStartPadding;

    playHead.style.left = `${newPosition}px`;
    if (newPosition < 0 || newPosition > width) {
      playHead.style.display = 'none';
    } else {
      playHead.style.display = 'block';
    }
  };

  const animatePlayHead = (timeStamp: number) => {
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    const playing = playHead.dataset.playing;

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

    calculateTrack();

    prevRef.current = timeStamp;
    requestAnimationFrame(animatePlayHead);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    playHead.dataset.playing = 'true';
    requestAnimationFrame(animatePlayHead);
  };

  const handleStop = () => {
    setIsPlaying(false);

    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    playHead.dataset.playing = '';
  };

  useEffect(() => {
    calculateTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelsPerSecond, shift, width]);

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

  const renderRuler = (ticks: { mainTicks: Tick[]; subTicks: Tick[] }) =>
    rulerRef.current?.render(
      ticks,
      shift * pixelsPerSecond,
      ticksStartPadding,
      '#9B9B9B',
    );

  const renderGrid = (ticks: { mainTicks: Tick[]; subTicks: Tick[] }) =>
    gridRef.current?.render(
      ticks,
      shift * pixelsPerSecond,
      ticksStartPadding,
      '#555555',
      '#2D2D2D',
    );

  const ticks = useTicks(realWidth * dpi, zoom, shift * pixelsPerSecond);

  useEffect(() => {
    renderRuler(ticks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticks, channels, width]);

  useEffect(() => {
    renderGrid(ticks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticks, channels, width, tracks]);

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <TrackInfoPanelMemoized
        playing={isPlaying}
        className='px-6 py-3'
        onPlay={handlePlay}
        onStop={handleStop}
        time={time}
      />
      <hr className='border-secondary' />
      <div className='relative flex h-full grow flex-col'>
        <div className='absolute left-[296px] z-10 h-full'>
          <div className='absolute top-0 h-full' ref={playHeadRef}>
            <div className='absolute -left-2 size-4 bg-accent' />
            <div className='absolute -left-2 top-4 size-0 border-x-8 border-t-8 border-x-transparent border-t-accent' />
            <div className='mx-auto h-full w-px bg-accent' />
          </div>
        </div>
        <div className='flex'>
          <TrackSidebarMemoized className='min-w-[296px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfoMemoized
                totalPlaytime={playlistTotalTime}
                tracksCount={playlist.tracks.length}
              />
            </TrackSidebarItem>
          </TrackSidebarMemoized>
          <div ref={containerRef} className='flex w-full items-center'>
            <TimelineRulerMemoized width={width} ref={rulerRef} />
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
          >
            {tracks === null ? (
              <span className='flex size-full flex-col items-center justify-center'>
                <span>{'Loading...'}</span>
                <span>{`${loadedTracksCount} / ${playlist.tracks.length}`}</span>
              </span>
            ) : (
              <>
                <TimelineGridMemoized
                  className='absolute'
                  width={width}
                  height={(channels.length + 2) * 96}
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
            realWidth={realWidth - width * 0.1}
            max={realWidth - width * 0.1}
            onChange={(e) => setShift(Number(e.currentTarget.value))}
          />
          <TrackFloatingMenuMemoized className='absolute bottom-[40px] left-[296px] right-0 mx-auto flex w-max' />
        </div>
      </div>
    </div>
  );
};
