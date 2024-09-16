'use client';

import { useCallback } from 'react';

import { AudioEditor } from '@/entities/audio-editor';
// eslint-disable-next-line boundaries/element-types
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
        case 'Cursor':
          audioEditor.tool = 'cursor';
          break;
        case 'Magnifier':
          audioEditor.tool = 'magnifier';
          break;
        case 'Cut':
          audioEditor.tool = 'scissors';
          break;
        case 'Fit':
          audioEditor.fit();
          break;
        case 'Loop':
          audioEditor.player.region.toggle();
          break;
        case 'Mute':
          audioEditor.selectedChannel?.toggleMute();
          break;
        case 'Solo':
          audioEditor.selectedChannel?.toggleSolo();
      }
    },
    [audioEditor],
  );

  useGlobalControls(handleGlobalControls);
};
