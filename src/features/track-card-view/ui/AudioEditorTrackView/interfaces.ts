import { AudioEditorManager } from '@/entities/audio-editor';
import { TrackCardProps, AudioEditorTrack } from '@/entities/track';

export interface AudioEditorTrackViewProps
  extends Omit<
    TrackCardProps,
    'ref' | 'track' | 'isSelected' | 'onTrackSelect' | 'onEdit' | 'fullWidth'
  > {
  audioEditorManager: AudioEditorManager;
  track: AudioEditorTrack;
  disableInteractive?: boolean;
}
