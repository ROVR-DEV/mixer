'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';
import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  channel,
  ignoreSelection,
  ignoreMuted,
  ...props
}: ChannelListItemViewProps) {
  const audioEditor = useAudioEditor();

  const handleClick = useCallback(() => {
    if (ignoreSelection) {
      return;
    }

    if (audioEditor.tool !== 'cursor') {
      return;
    }

    audioEditor.selectedChannel = channel;
  }, [ignoreSelection, audioEditor, channel]);

  return (
    <ChannelListItemMemoized
      isSelected={audioEditor.selectedChannel === channel}
      onClick={handleClick}
      ignoreSelection={ignoreSelection}
      isMuted={!ignoreMuted && audioEditor.player.isChannelMuted(channel)}
      {...props}
    />
  );
});
