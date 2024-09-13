import { cn } from '@/shared/lib';

import { CrossIcon } from '../../assets';
import { IconButton } from '../../components';

import { RemoveButtonProps } from './interfaces';

export const RemoveButton = ({ className, ...props }: RemoveButtonProps) => {
  return (
    <IconButton
      className={cn('size-7 border-error', className)}
      variant='secondary'
      aria-label='Remove'
      title='Remove'
      {...props}
    >
      <CrossIcon className='size-full p-2 [&_path]:stroke-error' />
    </IconButton>
  );
};
