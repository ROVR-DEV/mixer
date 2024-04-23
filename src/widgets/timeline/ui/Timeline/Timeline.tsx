'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useSize } from '@/shared/lib/useSize';

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
} from '@/features/timeline';
import { TrackChannelControlMemoized } from '@/features/track-channel-control';
import { TrackFloatingMenuMemoized } from '@/features/track-floating-menu';
import { TrackInfoPanelMemoized } from '@/features/track-info-panel';

import { TimelineProps } from './interfaces';

const ticksStartPadding = 5;

export const Timeline = ({ playlist, className, ...props }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const [tracks, setTracks] = useState<Record<string, Blob | undefined> | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    (async () => {
      const getBlobBoundByUuid = async (uuid: string) => [
        uuid,
        await getTrack(uuid),
      ];

      const blobs = await Promise.all(
        playlist.tracks.map((track) => getBlobBoundByUuid(track.uuid)),
      );

      setTracks(Object.fromEntries(blobs));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(playlist.tracks.map((track) => track.uuid))]);

  const [isPlaying, setIsPlaying] = useState(false);

  const playlistTotalTime = getPlaylistMaxTime(playlist);

  const _size = useSize(containerRef);
  const width = _size?.width ?? 0;

  const { zoom, shift, setShift, pixelsPerSecond, realWidth } =
    useTimelineProperties(timelineRef, width, playlistTotalTime, 100);

  const [channels, setChannels] = useState<{ id: number }[]>([
    {
      id: 1,
    },
    {
      id: 2,
    },
  ]);

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
    [playlist.tracks, shift, pixelsPerSecond, width],
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
        <div className='absolute left-[294px] z-10 h-full'>
          <div className='absolute top-0 h-full' ref={playHeadRef}>
            <div className='absolute -left-2 size-4 bg-accent' />
            <div className='absolute -left-2 top-4 size-0 border-x-8 border-t-8 border-x-transparent border-t-accent' />
            <div className='mx-auto h-full w-px bg-accent' />
          </div>
        </div>
        <div className='flex'>
          <TrackSidebarMemoized className='min-w-[294px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfoMemoized
                totalPlaytime={playlistTotalTime}
                tracksCount={playlist.tracks.length}
              />
            </TrackSidebarItem>
          </TrackSidebarMemoized>
          <div ref={containerRef} className='flex w-full items-center'>
            <TimelineRulerMemoized
              color='#9B9B9B'
              timelineWidth={realWidth}
              ticksStartPadding={5}
              width={width}
              shift={shift * pixelsPerSecond}
              zoom={zoom}
            />
          </div>
        </div>
        <hr className='border-secondary' />
        <div className='flex h-full grow overflow-auto'>
          <div className='min-h-max min-w-[294px] grow'>
            <TrackSidebarMemoized className='min-h-full'>
              {channels.map((channel, index) => (
                <TrackSidebarItemMemoized key={channel.id}>
                  <TrackChannelControlMemoized number={index + 1} />
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
              <span className='flex size-full items-center justify-center'>
                {'Loading...'}
              </span>
            ) : (
              <>
                <TrackSidebarItemMemoized className='relative'>
                  {evenTracks}
                </TrackSidebarItemMemoized>
                <TrackSidebarItemMemoized className='relative'>
                  {oddTracks}
                </TrackSidebarItemMemoized>
                <TrackSidebarItemMemoized className='invisible' />
              </>
            )}
          </div>
        </div>
      </div>
      <div className='relative flex grow'>
        <div className='min-w-[294px]' />
        <div className='w-full px-2'>
          <TimelineSlider
            className='w-full'
            zoom={zoom}
            value={shift}
            realWidth={realWidth - width * 0.1}
            max={realWidth - width * 0.1}
            onChange={(e) => setShift(Number(e.currentTarget.value))}
          />
          <TrackFloatingMenuMemoized className='absolute bottom-[40px] left-[294px] right-0 mx-auto w-max' />
        </div>
      </div>
    </div>
  );
};
