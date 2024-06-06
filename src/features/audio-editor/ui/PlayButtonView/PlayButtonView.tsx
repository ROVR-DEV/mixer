'use client';

import { observer } from 'mobx-react-lite';

import { PlayButton, useAudioEditorManager } from '@/entities/audio-editor';

import { PlayButtonViewProps } from './interfaces';

export const PlayButtonView = observer(function PlayButtonView({
  ...props
}: PlayButtonViewProps) {
  const audioEditorManager = useAudioEditorManager();

  return (
    <PlayButton
      isPlaying={audioEditorManager.isPlaying}
      onClick={audioEditorManager.play}
      {...props}
    />
  );
});
