'use client';

import { Button } from '@/shared/ui';

import { TrackEditMenuProps } from './interfaces';

export const TrackEditMenu = ({ ...props }: TrackEditMenuProps) => {
  return (
    <div className='flex h-full flex-col justify-between' {...props}>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent hover:bg-accent hover:text-primary'>
        {'Rename'}
      </Button>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent hover:bg-accent hover:text-primary'>
        {'Snap left'}
      </Button>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent hover:bg-accent hover:text-primary'>
        {'Snap right'}
      </Button>
      <Button className='min-h-[68px] rounded-none bg-transparent text-accent hover:bg-accent hover:text-primary'>
        {'Add an effect'}
      </Button>
    </div>
  );
};
