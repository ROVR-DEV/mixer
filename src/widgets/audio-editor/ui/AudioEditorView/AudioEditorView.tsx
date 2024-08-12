'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';

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

  useEffect(() => {
    if (audioEditor.player.tracks.length === 0) {
      audioEditor.importPlaylist(playlist);
    }

    audioEditor.player.updatePlaylist(playlist);

    playlist.tracks.forEach((track) => {
      if (!audioEditor.player.tracksByAudioUuid.has(track.uuid)) {
        audioEditor.importTrack(track);
      }
    });

    audioEditor.player.tracks.forEach((track) => {
      if (
        !playlist.tracks.find(
          (playlistTrack) => playlistTrack.uuid === track.meta.uuid,
        )
      ) {
        audioEditor.removeTrack(track);
      }
    });

    audioEditor.player.loadTracks();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditor.player, playlistKey]);

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
