import { forwardRef } from 'react';

import { MenuButton, MenuMemoized } from '@/shared/ui';

import { TrackContextMenuProps } from './interfaces';

export const TrackContextMenu = forwardRef<
  HTMLDivElement,
  TrackContextMenuProps
>(function TrackContextMenu({ onTrackRemove, ...props }, ref) {
  return (
    <MenuMemoized ref={ref} {...props}>
      <MenuButton onClick={onTrackRemove}>{'Remove'}</MenuButton>
    </MenuMemoized>
  );
});
