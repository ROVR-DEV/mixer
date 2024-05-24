import { IconButton } from '@/shared/ui';
import { SoloChannelIcon } from '@/shared/ui/assets';

import { SoloButtonProps } from './interfaces';

export const SoloButton = ({ isSolo, ...props }: SoloButtonProps) => {
  return (
    <IconButton
      className='size-7'
      role='switch'
      aria-label='Solo this track'
      aria-checked={isSolo}
      variant={isSolo ? 'primaryFilled' : 'secondary'}
      {...props}
    >
      <SoloChannelIcon />
    </IconButton>
  );
};
