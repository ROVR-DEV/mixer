'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTimeLoop } from '@/shared/lib';

import { AudioEditorManager, DEFAULT_CHANNELS } from '@/entities/audio-editor';
import { PlaylistDTO } from '@/entities/playlist';
import { TracksManager } from '@/entities/track';

import { importTracksToChannels } from './importTracksToChannels';
import { useAudioEditorGlobalControls } from './useAudioEditorGlobalControls';

export const useAudioEditor = (playlist: PlaylistDTO) => {
  const playlistKey = JSON.stringify(
    playlist.tracks.map((track) => track.uuid),
  );

  const [audioEditorManager] = useState(
    () => new AudioEditorManager(DEFAULT_CHANNELS),
  );
  const [tracksManager] = useState(() => new TracksManager(playlist.tracks));

  const onTimeUpdate = useCallback(
    (delta: number) => {
      audioEditorManager.time += delta / 1000;
      audioEditorManager.updateAudioBuffer();
    },
    [audioEditorManager],
  );

  useAudioEditorGlobalControls(audioEditorManager);

  useEffect(() => {
    importTracksToChannels(playlist.tracks, audioEditorManager);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditorManager, playlistKey]);

  useEffect(() => {
    tracksManager.downloadTracks();
  }, [tracksManager, playlistKey]);

  useTimeLoop({
    isRunning: audioEditorManager.isPlaying,
    onUpdate: onTimeUpdate,
  });

  return { audioEditorManager, tracksManager };
};
