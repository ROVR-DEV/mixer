import { Playlist } from '../model';

export const getPlaylistMaxTime = (playlist: Playlist) =>
  playlist.tracks.reduce((prev, current) => {
    return prev && prev.end > current.end ? prev : current;
  }).end;
