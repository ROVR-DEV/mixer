import { Channel, SoloButtonProps } from '@/entities/channel';

export interface SoloButtonViewProps extends Omit<SoloButtonProps, 'isSolo'> {
  channel: Channel;
}
