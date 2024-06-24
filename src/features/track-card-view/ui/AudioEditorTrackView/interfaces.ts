import { Player } from '@/entities/audio-editor';
import { TrackCardProps, AudioEditorTrack } from '@/entities/track';

export interface AudioEditorTrackViewProps
  extends Omit<
    TrackCardProps,
    'ref' | 'track' | 'isSelected' | 'onTrackSelect' | 'onEdit' | 'fullWidth'
  > {
  player: Player;
  track: AudioEditorTrack;
  disableInteractive?: boolean;
}
