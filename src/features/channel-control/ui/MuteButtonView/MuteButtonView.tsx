'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { MuteButton } from '@/entities/channel';

import { MuteButtonViewProps } from './interfaces';

export const MuteButtonView = observer(function MuteButtonView({
  channel,
  ...props
}: MuteButtonViewProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.toggleMute();
    },
    [channel],
  );

  return (
    <MuteButton isMuted={channel.isMuted} onClick={handleClick} {...props} />
  );
});
