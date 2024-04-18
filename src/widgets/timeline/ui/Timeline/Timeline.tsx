'use client';

import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useSize } from '@/shared/lib/useSize';

import {
  AddNewChannelButtonMemoized,
  PlaylistInfoMemoized,
  TrackSidebarItem,
  TrackSidebarItemMemoized,
  TrackSidebarMemoized,
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

export const Timeline = ({ className, ...props }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const _size = useSize(containerRef);
  const width = _size?.width ?? 0;

  const { zoom, shift, setShift } = useTimelineProperties(timelineRef);
  const [channels, setChannels] = useState<{ id: string }[]>([
    { id: Math.random().toString() },
    { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
    // { id: Math.random().toString() },
  ]);

  const addNewChannel = () => {
    setChannels((prevState) => [
      ...prevState,
      { id: Math.random().toString() },
    ]);
  };

  const handleSidebarVerticalScroll = (
    e: React.UIEvent<HTMLDivElement, UIEvent>,
  ) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
    }
  };

  const handleTimelineVerticalScroll = (
    e: React.UIEvent<HTMLDivElement, UIEvent>,
  ) => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = (e.target as HTMLElement).scrollTop;
    }
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <TrackInfoPanelMemoized className='px-6 py-3' />
      <hr className='border-secondary' />
      <div className='flex grow flex-col overflow-hidden'>
        <div className='flex'>
          <TrackSidebarMemoized className='min-w-[294px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfoMemoized />
            </TrackSidebarItem>
          </TrackSidebarMemoized>
          <div ref={containerRef} className='flex w-full items-center'>
            <TimelineRulerMemoized
              color='#9B9B9B'
              ticksStartPadding={5}
              width={width}
              shiftPercent={shift}
              zoom={zoom}
            />
          </div>
        </div>
        <hr className='border-secondary' />
        <div className='flex grow overflow-hidden'>
          <div
            ref={sidebarRef}
            className='min-w-[294px] grow overflow-y-auto'
            onScroll={handleSidebarVerticalScroll}
          >
            <TrackSidebarMemoized className='h-full'>
              {channels.map((channel) => (
                <TrackSidebarItemMemoized key={channel.id}>
                  <TrackChannelControlMemoized />
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
          <div className='relative flex w-full grow flex-col overflow-y-auto'>
            <div
              className='h-full grow overflow-auto'
              ref={timelineRef}
              onScroll={handleTimelineVerticalScroll}
            >
              {channels.map((channel) => (
                <TrackSidebarItemMemoized key={channel.id} />
              ))}
              <TrackSidebarItemMemoized className='invisible' />
            </div>
            <div className='w-full px-2'>
              <TimelineSlider
                className='w-full'
                zoom={zoom}
                value={shift}
                onChange={(e) => setShift(Number(e.currentTarget.value))}
              />
            </div>
            <TrackFloatingMenuMemoized className='absolute inset-x-0 bottom-[40px] mx-auto w-max' />
          </div>
        </div>
      </div>
    </div>
  );
};
