'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';
import { MuteButton } from '@/entities/channel';

import { MuteButtonViewProps } from './interfaces';

export const MuteButtonView = observer(function MuteButtonView({
  channel,
  ...props
}: MuteButtonViewProps) {
  const audioEditor = useAudioEditor();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.toggleMute();
      audioEditor.saveState();
    },
    [audioEditor, channel],
  );

  return (
    <MuteButton
      isMuted={audioEditor.player.isChannelMuted(channel)}
      onClick={handleClick}
      {...props}
    />
  );
});
