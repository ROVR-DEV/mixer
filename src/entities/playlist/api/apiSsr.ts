import { FetchResult, customFetch, fetchJson } from '@/shared/lib';

import { invalidatePlaylist } from '../lib';
import { Playlist, PlaylistDTO, toPlaylist } from '../model';

const PLAYLIST_BASE_URL = 'https://app.rovr.live/api/playlist';

const DEFAULT_HEADERS = {
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

export const addTrack = async (
  playlistId: number,
  data: FormData,
  side: 'first' | 'last',
) => {
  const url = `${PLAYLIST_BASE_URL}/${playlistId}/track/${side}`;

  const req = new Request(url, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: data,
  });

  const res = await customFetch(req);

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
    headers: DEFAULT_HEADERS,
  });

  const res = await customFetch(req);

  invalidatePlaylist(playlistId);

  return res;
};
