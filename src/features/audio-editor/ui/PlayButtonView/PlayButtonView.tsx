'use client';

import { observer } from 'mobx-react-lite';

import { PlayButton } from '@/entities/audio-editor';

import { PlayButtonViewProps } from './interfaces';

export const PlayButtonView = observer(function PlayButtonView({
  audioEditorManager,
  ...props
}: PlayButtonViewProps) {
  return (
    <PlayButton
      isPlaying={audioEditorManager.isPlaying}
      onClick={audioEditorManager.play}
      {...props}
    />
  );
});
