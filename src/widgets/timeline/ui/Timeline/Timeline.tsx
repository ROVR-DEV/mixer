'use client';

import { useMemo, useRef, useState } from 'react';

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

  const _size = useSize(containerRef);
  const width = _size?.width ?? 0;
  const realWidth = Math.max(
    playlist.tracks.reduce((prev, current) => {
      return prev && prev.end > current.end ? prev : current;
    }).end,
    1440,
  );

  const { zoom, shift, setShift, pixelsPerSecond } = useTimelineProperties(
    timelineRef,
    width,
    realWidth,
    100,
  );

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

    const shiftFromLeft = ticksStartPadding + trackStartPosition - shift;
    const trackWidth = durationInSeconds * pixelsPerSecond;

    const isVisible =
      trackStartPosition < width + shift && trackEndPosition > shift;

    return (
      <TrackWaveformCardMemoized
        className='absolute'
        key={track.uuid}
        track={track}
        enabled={isVisible}
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

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <TrackInfoPanelMemoized className='px-6 py-3' />
      <hr className='border-secondary' />
      <div className='flex h-full grow flex-col overflow-hidden'>
        <div className='flex'>
          <TrackSidebarMemoized className='min-w-[294px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfoMemoized />
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
            className='min-h-max w-full grow overflow-hidden'
            ref={timelineRef}
          >
            <TrackSidebarItemMemoized className='relative'>
              {evenTracks}
            </TrackSidebarItemMemoized>
            <TrackSidebarItemMemoized className='relative'>
              {oddTracks}
            </TrackSidebarItemMemoized>
            <TrackSidebarItemMemoized className='invisible' />
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
            realWidth={realWidth}
            max={realWidth * pixelsPerSecond * zoom - width}
            onChange={(e) => setShift(Number(e.currentTarget.value))}
          />
          <TrackFloatingMenuMemoized className='absolute bottom-[40px] left-[294px] right-0 mx-auto w-max' />
        </div>
      </div>
    </div>
  );
};
