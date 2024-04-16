'use client';

import { useRef, useState } from 'react';

import { useSize } from '@/shared/lib/useSize';
import { IconButton } from '@/shared/ui';
import { PlusIcon } from '@/shared/ui/assets';

import { PlaylistInfo, TrackSidebar, TrackSidebarItem } from '@/entities/track';

import { TimelineRuler, TimelineSlider } from '@/features/timeline';
import { TrackChannelControl } from '@/features/track-channel-control';
import { TrackFloatingMenu } from '@/features/track-floating-menu';
import { TrackInfoPanel } from '@/features/track-info-panel';

import { TimelineProps } from './interfaces';

export const Timeline = ({ ...props }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, _setZoom] = useState(1);
  const _size = useSize(containerRef);

  const width = _size?.width ?? 0;

  return (
    <div {...props}>
      <TrackInfoPanel className='px-6 py-3' />
      <hr className='border-secondary' />
      <div className='flex flex-1 flex-col'>
        <div className='flex'>
          <TrackSidebar className='min-w-[294px]'>
            <TrackSidebarItem className='items-start' disableBorder>
              <PlaylistInfo />
            </TrackSidebarItem>
          </TrackSidebar>
          <div ref={containerRef} className='flex w-full items-center'>
            <TimelineRuler width={width} shiftPercent={0} zoom={1} />
          </div>
        </div>
        <hr className='border-secondary' />
        <div className='flex flex-1'>
          <TrackSidebar className='min-w-[294px]'>
            <TrackSidebarItem>
              <TrackChannelControl />
            </TrackSidebarItem>
            <TrackSidebarItem>
              <TrackChannelControl />
            </TrackSidebarItem>
            <TrackSidebarItem className='justify-center' disableBorder>
              <IconButton>
                <PlusIcon />
              </IconButton>
            </TrackSidebarItem>
          </TrackSidebar>
          <div className='relative flex w-full flex-1 basis-full'>
            <TimelineSlider
              className='absolute bottom-1 self-end'
              zoom={zoom}
            />
            <TrackFloatingMenu className='absolute inset-x-0 bottom-[40px] mx-auto w-max' />
          </div>
        </div>
      </div>
    </div>
  );
};
