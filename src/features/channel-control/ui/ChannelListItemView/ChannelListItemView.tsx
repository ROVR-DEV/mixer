'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';
import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  player,
  channel,
  ignoreSelection,
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

    player.setSelectedChannel(channel.id);
  }, [ignoreSelection, audioEditor.tool, player, channel.id]);

  return (
    <ChannelListItemMemoized
      isSelected={player.selectedChannelId === channel.id}
      onClick={handleClick}
      ignoreSelection={ignoreSelection}
      {...props}
    />
  );
});
