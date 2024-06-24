'use client';

import { observer } from 'mobx-react-lite';

import { PlayButton, usePlayer } from '@/entities/audio-editor';

import { PlayButtonViewProps } from './interfaces';

export const PlayButtonView = observer(function PlayButtonView({
  ...props
}: PlayButtonViewProps) {
  const player = usePlayer();

  return (
    <PlayButton isPlaying={player.isPlaying} onClick={player.play} {...props} />
  );
});
