import { IconButton } from '@/shared/ui';
import { MuteChannelIcon } from '@/shared/ui/assets';

import { MuteButtonProps } from './interfaces';

export const MuteButton = ({ isMuted, ...props }: MuteButtonProps) => {
  return (
    <IconButton
      className='size-7'
      role='switch'
      aria-label='Mute\unmute this track'
      aria-checked={isMuted}
      variant={isMuted ? 'inverseFilled' : 'secondary'}
      {...props}
    >
      <MuteChannelIcon />
    </IconButton>
  );
};
