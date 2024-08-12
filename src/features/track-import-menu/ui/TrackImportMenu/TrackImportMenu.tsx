import { forwardRef } from 'react';

import { MenuButton, MenuMemoized } from '@/shared/ui';

import { TrackImportMenuProps } from './interfaces';

export const TrackImportMenu = forwardRef<HTMLDivElement, TrackImportMenuProps>(
  function TrackImportMenu(
    { onAddToTheEnd, onAddToNewChannel, onReplaceExisting, ...props },
    ref,
  ) {
    return (
      <MenuMemoized ref={ref} {...props}>
        <MenuButton onClick={onAddToTheEnd}>
          {'Add a new track to the end'}
        </MenuButton>
        <MenuButton onClick={onAddToNewChannel}>
          {'Add a new track to a new channel'}
        </MenuButton>
        <MenuButton onClick={onReplaceExisting}>
          {'Replace an existing song'}
        </MenuButton>
      </MenuMemoized>
    );
  },
);
