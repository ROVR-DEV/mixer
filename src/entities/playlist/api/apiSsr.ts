import { FetchResult, customFetch, fetchJson } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrack, TrackUpdate } from '@/entities/track';

import { invalidatePlaylist } from '../lib';
import { Playlist, PlaylistDTO, toPlaylist } from '../model';

const PLAYLIST_BASE_URL = 'https://app.rovr.live/api/playlist';

const HEADERS_WITH_AUTHORIZATION = {
  Authorization: 'Bearer 1e10f824-8fb2-4951-9815-d84d7bb141f5',
};

export const getPlaylist = async (
  id: string,
): Promise<FetchResult<Playlist>> => {
  const res = await fetchJson<PlaylistDTO>(
    `${process.env.BACKEND_URL}/site/playlist/${id}`,
    {
      next: { tags: [`playlist-${id}`] },
      cache: 'no-cache',
    },
  );

  if (res.data) {
    return { ...res, data: toPlaylist(res.data) };
  } else {
    return res;
  }
};

export const updateTracksInfo = async (
  playlistId: number,
  tracks: AudioEditorTrack[],
) => {
  const tracksInfo = tracks.map<TrackUpdate>((track) => ({
    id: track.meta.id,
    offset: track.startTime,
    duration: track.duration,
    filters: {
      fadeIn: track.filters.fadeInDuration,
      fadeOut: track.filters.fadeOutDuration,
    },
  }));

  return await customFetch(`${PLAYLIST_BASE_URL}/${playlistId}/mix/manual`, {
    method: 'POST',
    headers: HEADERS_WITH_AUTHORIZATION,
    body: JSON.stringify({
      tracks: tracksInfo,
    }),
  });
};

export const addTrack = async (
  playlistId: number,
  data: FormData,
  side: 'first' | 'last',
) => {
  const res = await customFetch(
    `${PLAYLIST_BASE_URL}/${playlistId}/track/${side}`,
    {
      method: 'POST',
      headers: HEADERS_WITH_AUTHORIZATION,
      body: data,
    },
  );

  invalidatePlaylist(playlistId);

  return res;
};

export const addTrackFirst = async (
  playlistId: number,
  data: FormData,
): Promise<FetchResult<Response>> => addTrack(playlistId, data, 'first');

export const addTrackLast = async (
  playlistId: number,
  data: FormData,
): Promise<FetchResult<Response>> => addTrack(playlistId, data, 'last');

export const removeTrack = async (
  playlistId: number,
  trackUuid: string,
): Promise<FetchResult<Response>> => {
  const url = `${PLAYLIST_BASE_URL}/${playlistId}/track/${trackUuid}`;

  const req = new Request(url, {
    method: 'DELETE',
    headers: HEADERS_WITH_AUTHORIZATION,
  });

  const res = await customFetch(req);

  invalidatePlaylist(playlistId);

  return res;
};
