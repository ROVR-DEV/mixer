import { TrackCardProps, AudioEditorTrack } from '@/entities/track';

// eslint-disable-next-line boundaries/element-types
import { TrackContextMenuView } from '@/features/track-context-menu';
import {
  TrackEditMenu,
  TrackEditMenuMemoized,
  // eslint-disable-next-line boundaries/element-types
} from '@/features/track-edit-menu';

export interface AudioEditorTrackViewProps
  extends Omit<
    TrackCardProps,
    | 'ref'
    | 'track'
    | 'isSelected'
    | 'onTrackSelect'
    | 'onEdit'
    | 'fullWidth'
    | 'contextMenu'
  > {
  track: AudioEditorTrack;
  disableInteractive?: boolean;
  editMenu?: typeof TrackEditMenu | typeof TrackEditMenuMemoized;
  contextMenu?: typeof TrackContextMenuView;
  ignoreSelection?: boolean;
}
