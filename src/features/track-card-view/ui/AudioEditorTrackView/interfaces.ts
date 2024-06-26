import { Player } from '@/entities/audio-editor';
import { TrackCardProps, AudioEditorTrack } from '@/entities/track';

// eslint-disable-next-line boundaries/element-types
import { TrackEditMenu } from '@/features/track-edit-menu';

export interface AudioEditorTrackViewProps
  extends Omit<
    TrackCardProps,
    'ref' | 'track' | 'isSelected' | 'onTrackSelect' | 'onEdit' | 'fullWidth'
  > {
  player: Player;
  track: AudioEditorTrack;
  disableInteractive?: boolean;
  editMenu?: typeof TrackEditMenu;
}
