import { TrackCardProps, AudioEditorTrack } from '@/entities/track';

// eslint-disable-next-line boundaries/element-types
import { TrackEditMenu } from '@/features/track-edit-menu';

export interface AudioEditorTrackViewProps
  extends Omit<
    TrackCardProps,
    'ref' | 'track' | 'isSelected' | 'onTrackSelect' | 'onEdit' | 'fullWidth'
  > {
  track: AudioEditorTrack;
  disableInteractive?: boolean;
  editMenu?: typeof TrackEditMenu;
}
