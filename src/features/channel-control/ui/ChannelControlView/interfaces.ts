import { AudioEditorManager } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';

import { ChannelControlProps } from '..';

export interface ChannelControlViewProps
  extends Omit<ChannelControlProps, 'onClickRemove'> {
  audioEditorManager: AudioEditorManager;
  channel: Channel;
}
