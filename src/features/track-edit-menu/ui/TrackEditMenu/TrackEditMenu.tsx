import { MenuButton, MenuMemoized } from '@/shared/ui';

import { TrackEditMenuProps } from './interfaces';

export const TrackEditMenu = ({
  onRename,
  onSnapLeft,
  onSnapRight,
  onAddEffect,
  ...props
}: TrackEditMenuProps) => {
  return (
    <MenuMemoized {...props}>
      <MenuButton onClick={onRename}>{'Rename'}</MenuButton>
      <MenuButton onClick={onSnapLeft}>{'Snap left'}</MenuButton>
      <MenuButton onClick={onSnapRight}>{'Snap right'}</MenuButton>
      <MenuButton onClick={onAddEffect}>{'Add an effect'}</MenuButton>
    </MenuMemoized>
  );
};
