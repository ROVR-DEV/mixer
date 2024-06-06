import { ChannelListProps } from '@/entities/channel';

export interface AudioEditorChannelsListProps
  extends Omit<ChannelListProps, 'children' | 'ref'> {}
