'use client';

import { useEffect, useState } from 'react';

import {
  AudioEditorContext,
  initializeAudioEditor,
  PlayerContext,
  useAudioEditorGlobalControls,
} from '@/entities/audio-editor';

import { AudioEditorProviderProps } from './interfaces';

export const AudioEditorProvider = ({
  children,
  playlist,
}: AudioEditorProviderProps) => {
  const [audioEditor] = useState(() => initializeAudioEditor());

  useEffect(() => {
    audioEditor.hydration(playlist);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditor, playlist.hash]);

  useAudioEditorGlobalControls(audioEditor);

  return (
    <AudioEditorContext.Provider value={audioEditor}>
      <PlayerContext.Provider value={audioEditor.player}>
        {children}
      </PlayerContext.Provider>
    </AudioEditorContext.Provider>
  );
};
