import { Playlist } from '@/entities/playlist';

export interface AudioEditorContentHeaderProps
  extends React.ComponentProps<'div'> {
  playlist: Playlist;
}
