'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTimeLoop } from '@/shared/lib';

import { Player } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';
import { PlaylistDTO } from '@/entities/playlist';
import { TrackData, TracksManager } from '@/entities/track';

import { importTracksToChannels } from './importTracksToChannels';

export const usePlayer = (playlist: PlaylistDTO) => {
  const playlistKey = JSON.stringify(
    playlist.tracks.map((track) => track.uuid),
  );

  const [player] = useState(() => new Player([new Channel(), new Channel()]));
  const [tracksManager] = useState(() => new TracksManager(playlist.tracks));

  const onTimeUpdate = useCallback(
    (delta: number) => {
      player.time += delta / 1000;
      player.updateAudioBuffer();
    },
    [player],
  );

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

  useTimeLoop({
    isRunning: player.isPlaying,
    onUpdate: onTimeUpdate,
  });

  return { player, tracksManager };
};
