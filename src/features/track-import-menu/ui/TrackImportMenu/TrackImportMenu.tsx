import { forwardRef } from 'react';

import { MenuButton, MenuMemoized } from '@/shared/ui';

import { TrackImportMenuProps } from './interfaces';

export const TrackImportMenu = forwardRef<HTMLDivElement, TrackImportMenuProps>(
  function TrackImportMenu(
    { onAddToTheEnd, onAddToNewChannel, onCancelUpload, ...props },
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
        <MenuButton onClick={onCancelUpload}>{'Cancel Upload'}</MenuButton>
      </MenuMemoized>
    );
  },
);
