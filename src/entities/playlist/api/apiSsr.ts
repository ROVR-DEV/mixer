import { HEADERS_WITH_AUTHORIZATION, JSON_HEADERS } from '@/shared/config';
import { FetchResult, customFetch, fetchJson } from '@/shared/lib';

import {
  AudioEditorTrack,
  tracksToTracksUpdateDto,
  TracksUpdateDto,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/track';

import { invalidatePlaylist } from '../lib';
import { Playlist, PlaylistDTO, toPlaylist } from '../model';

import { PLAYLIST_BASE_URL } from './endpoints';

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
  const body: TracksUpdateDto = tracksToTracksUpdateDto(tracks);

  return await customFetch(`${PLAYLIST_BASE_URL}/${playlistId}/mix/mixer`, {
    method: 'POST',
    headers: {
      ...HEADERS_WITH_AUTHORIZATION,
      ...JSON_HEADERS,
    },
    body: JSON.stringify(body),
  });
};

export const addTrack = async (
  playlistId: number,
  data: FormData,
  side: 'first' | 'last',
) => {
  const res = await fetchJson<PlaylistDTO>(
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
): Promise<FetchResult<PlaylistDTO>> => addTrack(playlistId, data, 'first');

export const addTrackLast = async (
  playlistId: number,
  data: FormData,
): Promise<FetchResult<PlaylistDTO>> => addTrack(playlistId, data, 'last');

export const removeTrack = async (
  playlistId: number,
  trackUuid: string,
): Promise<FetchResult<PlaylistDTO>> => {
  const url = `${PLAYLIST_BASE_URL}/${playlistId}/track/${trackUuid}`;

  const req = new Request(url, {
    method: 'DELETE',
    headers: HEADERS_WITH_AUTHORIZATION,
  });

  const res = await fetchJson<PlaylistDTO>(req);

  invalidatePlaylist(playlistId);

  return res;
};
