'use client';

import { observer } from 'mobx-react-lite';

import { StopButton } from '@/entities/audio-editor';

import { StopButtonViewProps } from './interfaces';

export const StopButtonView = observer(function StopButtonView({
  audioEditorManager,
  ...props
}: StopButtonViewProps) {
  return (
    <StopButton
      isPlaying={audioEditorManager.isPlaying}
      onClick={audioEditorManager.stop}
      {...props}
    />
  );
});
