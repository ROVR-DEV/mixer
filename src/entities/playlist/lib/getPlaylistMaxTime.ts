import { PlaylistDTO } from '../model';

export const getPlaylistMaxTime = (playlist: PlaylistDTO) =>
  !playlist.tracks.length
    ? 0
    : playlist.tracks.reduce((prev, current) => {
        return prev && prev.end > current.end ? prev : current;
      }).end;
