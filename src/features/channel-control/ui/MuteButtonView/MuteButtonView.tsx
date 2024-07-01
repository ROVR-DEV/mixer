'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { usePlayer } from '@/entities/audio-editor';
import { MuteButton } from '@/entities/channel';

import { MuteButtonViewProps } from './interfaces';

export const MuteButtonView = observer(function MuteButtonView({
  channel,
  ...props
}: MuteButtonViewProps) {
  const player = usePlayer();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.toggleMute();
    },
    [channel],
  );

  return (
    <MuteButton
      isMuted={player.isChannelMuted(channel)}
      onClick={handleClick}
      {...props}
    />
  );
});
