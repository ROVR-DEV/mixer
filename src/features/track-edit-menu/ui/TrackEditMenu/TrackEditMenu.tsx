'use client';

import { preventAll } from '@/shared/lib';

import { TrackEditMenuButton } from '../TrackEditMenuButton';

import { TrackEditMenuProps } from './interfaces';

export const TrackEditMenu = ({
  onRename,
  onSnapLeft,
  onSnapRight,
  onAddEffect,
  ...props
}: TrackEditMenuProps) => {
  return (
    <div
      className='flex h-max flex-col justify-between divide-y divide-accent'
      {...props}
    >
      <TrackEditMenuButton onClick={onRename} onMouseUp={preventAll}>
        {'Rename'}
      </TrackEditMenuButton>
      <TrackEditMenuButton onClick={onSnapLeft} onMouseUp={preventAll}>
        {'Snap left'}
      </TrackEditMenuButton>
      <TrackEditMenuButton onClick={onSnapRight} onMouseUp={preventAll}>
        {'Snap right'}
      </TrackEditMenuButton>
      <TrackEditMenuButton onClick={onAddEffect} onMouseUp={preventAll}>
        {'Add an effect'}
      </TrackEditMenuButton>
    </div>
  );
};
