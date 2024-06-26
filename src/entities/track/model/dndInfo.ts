import { DnDInfo } from '@/shared/model/dnd';

export interface TrackDnDInfo extends DnDInfo {
  startTime: number;
  prevChannelId?: string;
}
