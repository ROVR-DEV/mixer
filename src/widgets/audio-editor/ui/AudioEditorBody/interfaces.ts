import { PlaylistDTO } from '@/entities/playlist';

export interface TimelineViewProps extends React.ComponentProps<'div'> {
  playlist: PlaylistDTO;
}
