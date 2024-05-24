import { Channel, MuteButtonProps } from '@/entities/channel';

export interface MuteButtonViewProps extends Omit<MuteButtonProps, 'isMuted'> {
  channel: Channel;
}
