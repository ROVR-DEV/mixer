import { IconButton, StopIcon } from '@/shared/ui';

import { StopButtonProps } from './interfaces';

export const StopButton = ({ isPlaying, ...props }: StopButtonProps) => {
  return (
    <IconButton
      aria-label='Stop'
      title='Stop'
      aria-pressed={!isPlaying}
      disabled={!isPlaying}
      variant={isPlaying ? 'primaryFilled' : 'secondaryFilled'}
      {...props}
    >
      <StopIcon />
    </IconButton>
  );
};
