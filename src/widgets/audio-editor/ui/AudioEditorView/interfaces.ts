import { PlaylistDTO } from '@/entities/playlist';

// eslint-disable-next-line boundaries/element-types
import { TrackEditor } from '@/widgets/track-editor';

export interface AudioEditorViewProps extends React.ComponentProps<'div'> {
  playlist: PlaylistDTO;
  trackEditor: typeof TrackEditor;
}