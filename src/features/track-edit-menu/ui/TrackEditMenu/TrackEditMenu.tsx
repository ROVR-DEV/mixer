'use client';

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
      <TrackEditMenuButton onClick={onRename}>{'Rename'}</TrackEditMenuButton>
      <TrackEditMenuButton onClick={onSnapLeft}>
        {'Snap left'}
      </TrackEditMenuButton>
      <TrackEditMenuButton onClick={onSnapRight}>
        {'Snap right'}
      </TrackEditMenuButton>
      <TrackEditMenuButton onClick={onAddEffect}>
        {'Add an effect'}
      </TrackEditMenuButton>
    </div>
  );
};
