'use client';

import { observer } from 'mobx-react-lite';
import { forwardRef } from 'react';

import { MenuButton, MenuMemoized } from '@/shared/ui';

import { useAudioEditor } from '@/entities/audio-editor';

import { useTrackContextMenuHandlers } from '../../lib';

import { TrackContextMenuProps } from './interfaces';

const _TrackContextMenu = forwardRef<HTMLDivElement, TrackContextMenuProps>(
  function TrackContextMenu({ track, ...props }, ref) {
    const audioEditor = useAudioEditor();

    const { onTrackRemove } = useTrackContextMenuHandlers(audioEditor, track);

    return (
      <MenuMemoized ref={ref} {...props}>
        <MenuButton onClick={onTrackRemove}>{'Remove'}</MenuButton>
      </MenuMemoized>
    );
  },
);

export const TrackContextMenuView = observer(_TrackContextMenu);
