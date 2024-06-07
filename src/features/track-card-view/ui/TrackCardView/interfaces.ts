import { AudioEditorManager } from '@/entities/audio-editor';
import { TrackCardProps, TrackWithMeta } from '@/entities/track';

export interface TrackCardViewProps
  extends Omit<
    TrackCardProps,
    'ref' | 'track' | 'isSelected' | 'onTrackSelect' | 'onEdit'
  > {
  audioEditorManager: AudioEditorManager;
  track: TrackWithMeta;
  disableInteractive?: boolean;
}
