import { AudioEditorManager } from '@/entities/audio-editor';
import { Channel, ChannelListItemProps } from '@/entities/channel';

export interface ChannelListItemViewProps
  extends Omit<ChannelListItemProps, 'ref'> {
  audioEditorManager: AudioEditorManager;
  channel: Channel;
}
