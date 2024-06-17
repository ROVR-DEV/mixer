'use client';

import { Button } from '@/shared/ui';

import { TrackEditMenuProps } from './interfaces';

export const TrackEditMenu = ({ ...props }: TrackEditMenuProps) => {
  return (
    <div
      className='flex h-max flex-col justify-between divide-y divide-accent'
      {...props}
    >
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent outline-none hover:bg-accent hover:text-primary'>
        {'Rename'}
      </Button>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent outline-none hover:bg-accent hover:text-primary'>
        {'Snap left'}
      </Button>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent outline-none hover:bg-accent hover:text-primary'>
        {'Snap right'}
      </Button>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent outline-none hover:bg-accent hover:text-primary'>
        {'Add an effect'}
      </Button>
    </div>
  );
};
