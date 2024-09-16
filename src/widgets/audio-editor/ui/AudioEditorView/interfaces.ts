import { Playlist } from '@/entities/playlist';

import { AudioEditorLayoutProps } from '../AudioEditorLayout';

export interface AudioEditorViewProps
  extends Omit<AudioEditorLayoutProps, 'ref'> {
  playlist: Playlist;
}
