'use client';

import { useCallback } from 'react';

import { AudioEditorManager } from '@/entities/audio-editor';
import { GlobalControlsEvent, useGlobalControls } from '@/entities/event';

export const useAudioEditorGlobalControls = (
  audioEditorManager: AudioEditorManager,
) => {
  const handleGlobalControls = useCallback(
    (event: GlobalControlsEvent) => {
      if (event.type === 'Play/Pause') {
        if (audioEditorManager.isPlaying) {
          audioEditorManager.stop();
        } else {
          audioEditorManager.play();
        }
      }
    },
    [audioEditorManager],
  );

  useGlobalControls(handleGlobalControls);
};
