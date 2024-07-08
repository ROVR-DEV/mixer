'use client';

import { useEffect, useState } from 'react';

import { ObservablePlayer } from '@/entities/audio-editor';
import { PlaylistDTO } from '@/entities/playlist';
import { TrackData, TracksManager } from '@/entities/track';

import { importTracksToChannels } from './importTracksToChannels';

export const usePlayerSetup = (playlist: PlaylistDTO) => {
  const playlistKey = JSON.stringify(
    playlist.tracks.map((track) => track.uuid),
  );

  const [player] = useState(() => new ObservablePlayer());
  const [tracksManager] = useState(() => new TracksManager(playlist.tracks));

  useEffect(() => {
    importTracksToChannels(playlist.tracks, player);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, playlistKey]);

  useEffect(() => {
    const handleTrackLoad = (trackData: TrackData) => {
      if (!trackData.objectUrl) {
        return;
      }

      player.channels.forEach((channel) => {
        const currentTrack = channel.tracks.find(
          (track) => track.meta.uuid === trackData.uuid,
        );
        if (!currentTrack || !trackData.objectUrl) {
          return;
        }

        currentTrack.load(trackData.objectUrl);
      });
    };

    tracksManager.downloadTracks(handleTrackLoad);
  }, [tracksManager, playlistKey, player.channels]);

  return { player, tracksManager };
};
