'use client';

import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line boundaries/element-types
import { Playlist } from '@/entities/playlist';

import { getTrack } from '../api';

import { isTrackCachingEnabled } from './localStorage';

const getBlobBoundByUuid = async (uuid: string) => [
  uuid,
  (await getTrack(uuid, isTrackCachingEnabled())).data,
];

const downloadTracks = async (playlist: Playlist, onTrackLoad?: () => void) => {
  return await Promise.all(
    playlist.tracks.map((track) =>
      getBlobBoundByUuid(track.uuid).then((res) => {
        onTrackLoad?.();
        return res;
      }),
    ),
  );
};

export const useTracks = (playlist: Playlist) => {
  const [tracks, setTracks] = useState<Record<
    string,
    Blob | string | undefined
  > | null>(null);
  const [loadedTracksCount, setLoadedTracksCount] = useState(0);
  const isDownloading = useRef<boolean>(false);

  const playlistKey = JSON.stringify(
    playlist.tracks.map((track) => track.uuid),
  );

  const updateTracks = async (playlist: Playlist) => {
    isDownloading.current = true;

    const blobs = await downloadTracks(playlist, () => {
      setLoadedTracksCount((prevState) => prevState + 1);
    });

    setTracks(Object.fromEntries(blobs));

    isDownloading.current = false;
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (process.env.NEXT_PUBLIC_DEBUG_LOAD_TRACKS === 'false') {
      setTracks({});
      return;
    }

    if (isDownloading.current) {
      return;
    }

    updateTracks(playlist);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistKey]);

  return { tracks, loadedTracksCount };
};
