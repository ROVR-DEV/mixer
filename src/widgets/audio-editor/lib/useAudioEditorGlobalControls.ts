'use client';

import { useCallback } from 'react';

import { Player } from '@/entities/audio-editor';
import { GlobalControlsEvent, useGlobalControls } from '@/entities/event';

export const useAudioEditorGlobalControls = (player: Player) => {
  const handleGlobalControls = useCallback(
    (event: GlobalControlsEvent) => {
      switch (event.type) {
        case 'Play/Pause':
          if (player.isPlaying) {
            player.stop();
          } else {
            player.play();
          }
          break;
        case 'Undo':
          player.undo();
          break;
        case 'Redo':
          player.redo();
          break;
      }
    },
    [player],
  );

  useGlobalControls(handleGlobalControls);
};
