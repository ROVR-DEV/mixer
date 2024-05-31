'use client';

import { useEffect, useState } from 'react';

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

  useAudioEditorGlobalControls(audioEditorManager);

  useEffect(() => {
    importTracksToChannels(playlist.tracks, audioEditorManager);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditorManager, playlistKey]);

  useEffect(() => {
    tracksManager.downloadTracks();
  }, [tracksManager, playlistKey]);

  return { audioEditorManager, tracksManager };
};
