import { IconButton } from '@/shared/ui';
import { PlayIcon } from '@/shared/ui/assets';

import { PlayButtonProps } from './interfaces';

export const PlayButton = ({ isPlaying, ...props }: PlayButtonProps) => {
  return (
    <IconButton
      className='pl-[2px]'
      aria-label='Play'
      disabled={isPlaying}
      variant={isPlaying ? 'secondaryFilled' : 'primaryFilled'}
      {...props}
    >
      <PlayIcon />
    </IconButton>
  );
};
