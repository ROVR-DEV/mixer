import { useCallback } from 'react';

import { useAudioEditor, usePlayer } from '@/entities/audio-editor';

import { ChannelListItemClickViewProps } from './interfaces';

export const ChannelListItemClickView = ({
  channel,
  ...props
}: ChannelListItemClickViewProps) => {
  const audioEditor = useAudioEditor();
  const player = usePlayer();

  const handleClick = useCallback(() => {
    if (audioEditor.tool !== 'cursor') {
      return;
    }

    player.setSelectedChannel(channel.id);
  }, [audioEditor.tool, player, channel.id]);

  return <div onClick={handleClick} {...props} />;
};
