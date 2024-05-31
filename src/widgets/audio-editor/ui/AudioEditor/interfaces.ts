import { PlaylistDTO } from '@/entities/playlist';

export interface AudioEditorProps extends React.ComponentProps<'div'> {
  playlist: PlaylistDTO;
}
