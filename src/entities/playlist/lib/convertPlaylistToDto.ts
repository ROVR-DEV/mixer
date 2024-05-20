import { Playlist, PlaylistDTO } from '../model';

import { getPlaylistMaxTime } from './getPlaylistMaxTime';

export const convertPlaylistToDto = (playlist: Playlist): PlaylistDTO => {
  return { ...playlist, duration_in_seconds: getPlaylistMaxTime(playlist) };
};
