import { AudioEditorManager } from '@/entities/audio-editor';
import { ChannelListProps } from '@/entities/channel';

export interface AudioEditorChannelsListProps
  extends Omit<ChannelListProps, 'children' | 'ref'> {
  audioEditorManager: AudioEditorManager;
  trackHeight: number;
}
