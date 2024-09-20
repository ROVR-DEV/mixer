'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';
import { removeTrack } from '@/entities/playlist';

import { ChannelControl, ChannelRemoveDialog } from '..';

import { ChannelControlViewProps } from './interfaces';

export const ChannelControlView = observer(function ChannelControlView({
  channel,
  number,
  ...props
}: ChannelControlViewProps) {
  const audioEditor = useAudioEditor();

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);

  const handleOpenRemoveDialog = useCallback(
    () => setIsConfirmationDialogOpen(true),
    [],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.tracks.forEach((track) => audioEditor.unselectTrack(track));
      channel.tracks.forEach((track) => {
        if (audioEditor.player.playlist !== null) {
          removeTrack(audioEditor.player.playlist.id, track.meta.uuid);
        }
      });
      audioEditor.player.removeChannel(channel);
      audioEditor.saveState();
      setIsConfirmationDialogOpen(false);
    },
    [audioEditor, channel],
  );

  return (
    <>
      <ChannelControl
        channel={channel}
        number={number}
        isSelected={audioEditor.selectedChannel === channel}
        onClickRemove={handleOpenRemoveDialog}
        {...props}
      />
      <ChannelRemoveDialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
        number={number}
        onRemove={handleRemove}
      />
    </>
  );
});
