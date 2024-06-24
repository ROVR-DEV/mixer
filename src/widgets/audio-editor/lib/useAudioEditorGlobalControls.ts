'use client';

import { useCallback } from 'react';

import { Player } from '@/entities/audio-editor';
import { GlobalControlsEvent, useGlobalControls } from '@/entities/event';

export const useAudioEditorGlobalControls = (player: Player) => {
  const handleGlobalControls = useCallback(
    (event: GlobalControlsEvent) => {
      if (event.type === 'Play/Pause') {
        if (player.isPlaying) {
          player.stop();
        } else {
          player.play();
        }
      }
    },
    [player],
  );

  useGlobalControls(handleGlobalControls);
};
