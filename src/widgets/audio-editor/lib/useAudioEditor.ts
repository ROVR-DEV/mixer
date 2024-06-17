'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTimeLoop } from '@/shared/lib';

import { AudioEditorManager } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';
import { PlaylistDTO } from '@/entities/playlist';
import { TrackData, TracksManager } from '@/entities/track';

import { importTracksToChannels } from './importTracksToChannels';
import { useAudioEditorGlobalControls } from './useAudioEditorGlobalControls';

export const useAudioEditor = (playlist: PlaylistDTO) => {
  const playlistKey = JSON.stringify(
    playlist.tracks.map((track) => track.uuid),
  );

  const [audioEditorManager] = useState(
    () => new AudioEditorManager([new Channel(), new Channel()]),
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
    const handleTrackLoad = (trackData: TrackData) => {
      if (!trackData.objectUrl) {
        return;
      }

      audioEditorManager.channels.forEach((channel) => {
        const currentTrack = channel.tracks.find(
          (track) => track.originalTrack.uuid === trackData.uuid,
        );
        if (!currentTrack || !trackData.objectUrl) {
          return;
        }

        currentTrack.initAudioElement(trackData.objectUrl);
      });
    };

    tracksManager.downloadTracks(handleTrackLoad);
  }, [tracksManager, playlistKey, audioEditorManager.channels]);

  useTimeLoop({
    isRunning: audioEditorManager.isPlaying,
    onUpdate: onTimeUpdate,
  });

  return { audioEditorManager, tracksManager };
};
