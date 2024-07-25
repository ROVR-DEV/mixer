import { FetchResult, fetchJson } from '@/shared/lib';

import { Playlist, PlaylistDTO, toPlaylist } from '../model';

export const getPlaylist = async (
  id: string,
): Promise<FetchResult<Playlist>> => {
  const res = await fetchJson<PlaylistDTO>(
    `${process.env.BACKEND_URL}/site/playlist/${id}`,
    {
      cache: 'force-cache',
    },
  );

  if (res.data) {
    return { ...res, data: toPlaylist(res.data) };
  } else {
    return res;
  }
};
