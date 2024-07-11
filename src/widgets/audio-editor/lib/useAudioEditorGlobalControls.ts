'use client';

import { useCallback } from 'react';

import { AudioEditor } from '@/entities/audio-editor';
import { GlobalControlsEvent, useGlobalControls } from '@/entities/event';

export const useAudioEditorGlobalControls = (audioEditor: AudioEditor) => {
  const handleGlobalControls = useCallback(
    (event: GlobalControlsEvent) => {
      switch (event.type) {
        case 'Play/Pause':
          if (audioEditor.player.isPlaying) {
            audioEditor.player.stop();
          } else {
            audioEditor.player.play();
          }
          break;
        case 'Undo':
          audioEditor.undo();
          break;
        case 'Redo':
          audioEditor.redo();
          break;
      }
    },
    [audioEditor],
  );

  useGlobalControls(handleGlobalControls);
};
