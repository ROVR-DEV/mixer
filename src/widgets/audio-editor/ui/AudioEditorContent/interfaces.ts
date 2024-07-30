import { Playlist } from '@/entities/playlist';

export interface TimelineViewProps extends React.ComponentProps<'div'> {
  playlist: Playlist;
}
