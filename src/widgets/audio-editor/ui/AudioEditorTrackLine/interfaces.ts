import { AudioEditorManager } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';
import { TrackWithMeta } from '@/entities/track';

export interface AudioEditorTrackProps {
  channel: Channel;
  selectedTrack: TrackWithMeta | null;
  onTrackSelect: (track: TrackWithMeta) => void;
  tracksData: Record<string, string | Blob | undefined>;
  audioEditorManager: AudioEditorManager;
}
