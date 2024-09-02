import { AudioEditor } from '@/entities/audio-editor';
import { Playlist } from '@/entities/playlist';

// eslint-disable-next-line boundaries/element-types
import { PlaylistLoadingProgressDialog } from '@/widgets/playlist-loading-progress-dialog';
// eslint-disable-next-line boundaries/element-types
import { TrackEditor } from '@/widgets/track-editor';

export interface AudioEditorViewProps extends React.ComponentProps<'div'> {
  playlist: Playlist;
  playlistKey: string;
  audioEditor?: AudioEditor;
  trackEditor: typeof TrackEditor;
  playlistLoadingProgressDialog: typeof PlaylistLoadingProgressDialog;
}
