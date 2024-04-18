'use client';

import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useSize } from '@/shared/lib/useSize';
import { IconButton } from '@/shared/ui';
import { PlusIcon } from '@/shared/ui/assets';

import { PlaylistInfo, TrackSidebar, TrackSidebarItem } from '@/entities/track';

import {
  TimelineRuler,
  TimelineSlider,
  useTimelineProperties,
} from '@/features/timeline';
import { TrackChannelControl } from '@/features/track-channel-control';
import { TrackFloatingMenu } from '@/features/track-floating-menu';
import { TrackInfoPanel } from '@/features/track-info-panel';

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
      <TrackInfoPanel className='px-6 py-3' />
      <hr className='border-secondary' />
      <div className='flex grow flex-col overflow-hidden'>
        <div className='flex'>
          <TrackSidebar className='min-w-[294px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfo />
            </TrackSidebarItem>
          </TrackSidebar>
          <div ref={containerRef} className='flex w-full items-center'>
            <TimelineRuler
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
            <TrackSidebar className='h-full'>
              {channels.map((channel) => (
                <TrackSidebarItem key={channel.id}>
                  <TrackChannelControl />
                </TrackSidebarItem>
              ))}
              <TrackSidebarItem className='justify-center' disableBorder>
                <IconButton onClick={addNewChannel}>
                  <PlusIcon />
                </IconButton>
              </TrackSidebarItem>
            </TrackSidebar>
          </div>
          <div className='relative flex w-full grow flex-col overflow-y-auto'>
            <div
              className='h-full grow overflow-auto'
              ref={timelineRef}
              onScroll={handleTimelineVerticalScroll}
            >
              {channels.map((channel) => (
                <TrackSidebarItem key={channel.id} />
              ))}
              <TrackSidebarItem className='invisible' />
            </div>
            <div className='w-full px-2'>
              <TimelineSlider
                className='w-full'
                zoom={zoom}
                value={shift}
                onChange={(e) => setShift(Number(e.currentTarget.value))}
              />
            </div>
            <TrackFloatingMenu className='absolute inset-x-0 bottom-[40px] mx-auto w-max' />
          </div>
        </div>
      </div>
    </div>
  );
};
