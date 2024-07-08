import { useCallback } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';

import { ChannelListItemClickViewProps } from './interfaces';

export const ChannelListItemClickView = ({
  channel,
  ...props
}: ChannelListItemClickViewProps) => {
  const audioEditor = useAudioEditor();

  const handleClick = useCallback(() => {
    if (audioEditor.tool !== 'cursor') {
      return;
    }

    audioEditor.selectedChannel = channel;
  }, [audioEditor, channel]);

  return <div onClick={handleClick} {...props} />;
};
