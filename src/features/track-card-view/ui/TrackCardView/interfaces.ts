import { AudioEditorManager } from '@/entities/audio-editor';
import { TrackCardProps, TrackWithMeta } from '@/entities/track';

export interface TrackCardViewProps
  extends Omit<
    TrackCardProps,
    | 'ref'
    | 'track'
    | 'isSelected'
    | 'onTrackSelect'
    | 'waveformComponent'
    | 'onEdit'
  > {
  audioEditorManager: AudioEditorManager;
  track: TrackWithMeta;
  ignoreSelection?: boolean;
}
