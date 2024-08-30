'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';

import { ChannelControlMemoized, ChannelRemoveDialog } from '..';

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
      audioEditor.player.removeChannel(channel);
      audioEditor.saveState();
      setIsConfirmationDialogOpen(false);
    },
    [audioEditor, channel],
  );

  return (
    <>
      <ChannelControlMemoized
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
