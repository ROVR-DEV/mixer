import MurmurHash3 from 'imurmurhash';

import { getPlaylistMaxTime } from '../lib';

import { PlaylistDTO } from './playlistDto';

export interface Playlist extends PlaylistDTO {
  duration_in_seconds: number;
  hash: number;
}

export const toPlaylist = (playlist: PlaylistDTO): Playlist => {
  return {
    ...playlist,
    duration_in_seconds: getPlaylistMaxTime(playlist),
    hash: MurmurHash3(JSON.stringify(playlist)).result(),
  };
};
