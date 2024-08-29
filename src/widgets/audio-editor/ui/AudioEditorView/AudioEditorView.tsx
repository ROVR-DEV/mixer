'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib';

import {
  AudioEditorContext,
  initializeAudioEditor,
  PlayerContext,
} from '@/entities/audio-editor';

import { useAudioEditorGlobalControls } from '../../lib';
import { AudioEditorContent } from '../AudioEditorContent';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';

import { AudioEditorViewProps } from './interfaces';

export const AudioEditorView = observer(function AudioEditorView({
  playlist,
  playlistKey,
  trackEditor: TrackEditor,
  className,
  ...props
}: AudioEditorViewProps) {
  const audioEditor = useMemo(() => initializeAudioEditor(), []);
  const previousKeyRef = useRef<string>('');

  useEffect(() => {
    if (previousKeyRef.current === playlistKey) {
      return;
    }

    audioEditor.hydration(playlist);

    previousKeyRef.current = playlistKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditor, audioEditor.player, playlistKey]);

  useAudioEditorGlobalControls(audioEditor);

  return (
    <AudioEditorContext.Provider value={audioEditor}>
      <PlayerContext.Provider value={audioEditor.player}>
        <div className={cn('flex flex-col relative', className)} {...props}>
          <AudioEditorHeaderMemoized />
          <AudioEditorContent playlist={playlist} />
          {!audioEditor.editableTrack ? null : (
            <TrackEditor className='absolute bottom-[100px] z-40 h-[43%] max-h-[466px] min-h-[161px] w-full' />
          )}
        </div>
      </PlayerContext.Provider>
    </AudioEditorContext.Provider>
  );
});
