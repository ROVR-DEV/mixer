import { getPlaylistMaxTime } from '../lib';

import { PlaylistDTO } from './playlistDto';

export interface Playlist extends PlaylistDTO {
  duration_in_seconds: number;
}

export const toPlaylist = (playlist: PlaylistDTO): Playlist => {
  return {
    ...playlist,
    duration_in_seconds: getPlaylistMaxTime(playlist),
  };
};
