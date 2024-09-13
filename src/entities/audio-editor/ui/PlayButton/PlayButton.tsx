import { IconButton, PlayIcon } from '@/shared/ui';

import { PlayButtonProps } from './interfaces';

export const PlayButton = ({ isPlaying, ...props }: PlayButtonProps) => {
  return (
    <IconButton
      className='pl-[2px]'
      aria-label='Play'
      title='Play'
      aria-pressed={isPlaying}
      disabled={isPlaying}
      variant={isPlaying ? 'secondaryFilled' : 'primaryFilled'}
      {...props}
    >
      <PlayIcon />
    </IconButton>
  );
};
