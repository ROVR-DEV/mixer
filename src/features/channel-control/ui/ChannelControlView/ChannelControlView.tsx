'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';

import { ChannelControlMemoized } from '..';

import { ChannelControlViewProps } from './interfaces';

export const ChannelControlView = observer(function ChannelControlView({
  channel,
  ...props
}: ChannelControlViewProps) {
  const audioEditor = useAudioEditor();

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.tracks.forEach((track) => audioEditor.unselectTrack(track));
      audioEditor.player.removeChannel(channel);
      audioEditor.saveState();
    },
    [audioEditor, channel],
  );

  return (
    <ChannelControlMemoized
      channel={channel}
      isSelected={audioEditor.selectedChannel === channel}
      onClickRemove={handleRemove}
      {...props}
    />
  );
});
