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
      tabIndex={0}
      className='flex h-max flex-col justify-between divide-y divide-accent outline-none'
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
