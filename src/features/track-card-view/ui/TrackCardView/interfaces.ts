import { AudioEditorManager } from '@/entities/audio-editor';
import { TrackCardProps, TrackWithMeta } from '@/entities/track';

export interface TrackCardViewProps
  extends Omit<
    TrackCardProps,
    'ref' | 'track' | 'isSelected' | 'onTrackSelect' | 'waveformComponent'
  > {
  audioEditorManager: AudioEditorManager;
  track: TrackWithMeta;
  trackData: string | Blob | undefined;
}
