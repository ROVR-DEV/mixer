'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useAudioEditor } from '@/entities/audio-editor';
import { SoloButton } from '@/entities/channel';

import { SoloButtonViewProps } from './interfaces';

export const SoloButtonView = observer(function SoloButtonView({
  channel,
  ...props
}: SoloButtonViewProps) {
  const audioEditor = useAudioEditor();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.toggleSolo();
      audioEditor.saveState();
    },
    [audioEditor, channel],
  );

  return (
    <SoloButton isSolo={channel.isSolo} onClick={handleClick} {...props} />
  );
});
