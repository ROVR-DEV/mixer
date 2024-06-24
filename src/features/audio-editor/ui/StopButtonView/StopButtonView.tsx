'use client';

import { observer } from 'mobx-react-lite';

import { StopButton, usePlayer } from '@/entities/audio-editor';

import { StopButtonViewProps } from './interfaces';

export const StopButtonView = observer(function StopButtonView({
  ...props
}: StopButtonViewProps) {
  const player = usePlayer();

  return (
    <StopButton isPlaying={player.isPlaying} onClick={player.stop} {...props} />
  );
});
