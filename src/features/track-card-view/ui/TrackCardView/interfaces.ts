import { Channel } from '@/entities/channel';
import { TrackCardProps, TrackWithMeta } from '@/entities/track';

export interface TrackCardViewProps
  extends Omit<TrackCardProps, 'ref' | 'track' | 'waveformComponent'> {
  channel: Channel;
  track: TrackWithMeta;
  onTrackSelect: (track: TrackWithMeta, staySelected?: boolean) => void;
  trackData: string | Blob | undefined;
}
