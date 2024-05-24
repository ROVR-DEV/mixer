import { IconButton } from '@/shared/ui';
import { StopIcon } from '@/shared/ui/assets';

import { StopButtonProps } from './interfaces';

export const StopButton = ({ isPlaying, ...props }: StopButtonProps) => {
  return (
    <IconButton
      aria-label='Stop'
      disabled={!isPlaying}
      variant={isPlaying ? 'primaryFilled' : 'secondaryFilled'}
      {...props}
    >
      <StopIcon />
    </IconButton>
  );
};
