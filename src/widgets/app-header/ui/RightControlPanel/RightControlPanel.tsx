import Link from 'next/link';

import { cn } from '@/shared/lib';
import { Button, IconButton } from '@/shared/ui';
import { PersonIcon } from '@/shared/ui/assets';

import { RightControlPanelProps } from './interfaces';

export const RightControlPanel = ({
  className,
  ...props
}: RightControlPanelProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between justify-self-end',
        className,
      )}
      {...props}
    >
      <Button aria-label='Publish' className='h-7 text-[13px] uppercase italic'>
        <span className='font-fix'>{'Publish'}</span>
      </Button>
      <div className='flex items-center gap-5'>
        <Link className='text-accent' href='#'>
          <span className='font-fix'>{'Hello '}</span>
          <span className='font-bold'>{'LeFto'}</span>
        </Link>
        <IconButton
          className='size-7'
          variant='primaryFilled'
          aria-label='profile'
        >
          <PersonIcon height={14} />
        </IconButton>
      </div>
    </div>
  );
};
