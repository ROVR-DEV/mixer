'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { Dialog, DialogContent, DialogHeading } from '@/shared/ui';

import { usePlayer } from '@/entities/audio-editor';

import { PlaylistLoadingError } from '@/features/playlist-loading-error';
import { PlaylistLoadingProgress } from '@/features/playlist-loading-progress';

import { PlaylistLoadingProgressDialogProps } from './interfaces';

export const PlaylistLoadingProgressDialog = observer(
  function PlaylistLoadingProgressDialog({
    ...props
  }: PlaylistLoadingProgressDialogProps) {
    const player = usePlayer();

    const isDialogOpen = useMemo(
      () =>
        player.trackLoader.loadedTracksCount !==
        player.trackLoader.tracksData.size,
      [
        player.trackLoader.loadedTracksCount,
        player.trackLoader.tracksData.size,
      ],
    );

    return (
      <Dialog open={isDialogOpen} initialOpen {...props}>
        <DialogContent className='flex max-w-[500px] flex-col gap-2 overflow-hidden rounded-lg border border-accent bg-primary px-4 py-3 text-third-light outline-none'>
          <DialogHeading className='py-1'>{'Loading project'}</DialogHeading>
          <PlaylistLoadingProgress
            downloadedTracksCount={player.trackLoader.loadedTracksCount}
            tracksCount={player.trackLoader.tracksData.size}
          />
          <PlaylistLoadingError />
        </DialogContent>
      </Dialog>
    );
  },
);
