import { IconButton } from '@/shared/ui';
import { MuteChannelIcon } from '@/shared/ui/assets';

import { MuteButtonProps } from './interfaces';

export const MuteButton = ({ isMuted, ...props }: MuteButtonProps) => {
  return (
    <IconButton
      className='size-7'
      title='Mute'
      aria-label='Mute\unmute this track'
      aria-pressed={isMuted}
      variant={isMuted ? 'inverseFilled' : 'secondary'}
      {...props}
    >
      <MuteChannelIcon />
    </IconButton>
  );
};
