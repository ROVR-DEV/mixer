import { IconButton } from '@/shared/ui';
import { SoloChannelIcon } from '@/shared/ui/assets';

import { SoloButtonProps } from './interfaces';

export const SoloButton = ({ isSolo, ...props }: SoloButtonProps) => {
  return (
    <IconButton
      className='size-7'
      title='Solo'
      aria-label='Solo this track'
      aria-pressed={isSolo}
      variant={isSolo ? 'primaryFilled' : 'secondary'}
      {...props}
    >
      <SoloChannelIcon />
    </IconButton>
  );
};
