import { Playlist } from './playlist';

export interface PlaylistDTO extends Playlist {
  duration_in_seconds: number;
}
