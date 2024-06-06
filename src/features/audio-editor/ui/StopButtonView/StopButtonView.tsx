'use client';

import { observer } from 'mobx-react-lite';

import { StopButton, useAudioEditorManager } from '@/entities/audio-editor';

import { StopButtonViewProps } from './interfaces';

export const StopButtonView = observer(function StopButtonView({
  ...props
}: StopButtonViewProps) {
  const audioEditorManager = useAudioEditorManager();

  return (
    <StopButton
      isPlaying={audioEditorManager.isPlaying}
      onClick={audioEditorManager.stop}
      {...props}
    />
  );
});
