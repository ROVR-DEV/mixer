'use client';

import { useCallback } from 'react';

import { useWindowEvent } from '@/shared/lib';
import { KeyBind } from '@/shared/model/';

import {
  AudioEditor,
  AudioEditorEvent,
  KEY_BINDINGS,
} from '@/entities/audio-editor';

export const useAudioEditorGlobalControls = (audioEditor: AudioEditor) => {
  const handleEvent = useCallback(
    (e: KeyboardEvent, type: AudioEditorEvent) => {
      switch (type) {
        case 'Play/Pause':
          e.preventDefault();

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        audioEditor.player.trackLoader.isDownloading ||
        audioEditor.player.trackLoader.isUploading
      ) {
        return;
      }

      const keyBind = KeyBind.fromKeyboardEvent(e);
      const type = KEY_BINDINGS[keyBind.toString()];

      handleEvent(e, type);
    },
    [
      audioEditor.player.trackLoader.isDownloading,
      audioEditor.player.trackLoader.isUploading,
      handleEvent,
    ],
  );

  useWindowEvent('keydown', handleKeyDown);
};
