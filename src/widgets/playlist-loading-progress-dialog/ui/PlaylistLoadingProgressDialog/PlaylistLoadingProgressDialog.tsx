'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { Dialog, DialogContent, DialogHeading } from '@/shared/ui';

import { usePlayer } from '@/entities/audio-editor';

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
        <DialogContent className='flex flex-col gap-2 rounded-lg border border-accent bg-primary px-4 py-3 text-third-light'>
          <DialogHeading>{'Loading project'}</DialogHeading>
          <PlaylistLoadingProgress
            downloadedTracksCount={player.trackLoader.loadedTracksCount}
            tracksCount={player.trackLoader.tracksData.size}
          />
        </DialogContent>
      </Dialog>
    );
  },
);
