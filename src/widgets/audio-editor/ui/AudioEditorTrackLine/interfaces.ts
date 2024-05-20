import { Channel } from '@/entities/channel';
import { TrackWithMeta } from '@/entities/track';

export interface AudioEditorTrackProps {
  channel: Channel;
  selectedTrack: TrackWithMeta | null;
  onTrackSelect: (track: TrackWithMeta, staySelected?: boolean) => void;
  tracksData: Record<string, string | Blob | undefined>;
}
