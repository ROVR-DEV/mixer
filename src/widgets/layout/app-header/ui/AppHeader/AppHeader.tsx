import Link from 'next/link';

import { cn } from '@/shared/lib/cn';
import { Button, IconButton } from '@/shared/ui';
import { PersonIcon } from '@/shared/ui/assets';

import { AppHeaderProps } from './interfaces';

export const AppHeader = ({ className, ...props }: AppHeaderProps) => {
  return (
    <header
      className={cn(
        'flex h-16 items-center justify-end border-b border-b-secondary px-5 py-4',
        className,
      )}
      {...props}
    >
      <div className='flex items-center gap-5'>
        <Button
          aria-label='Save mix'
          className='h-7 text-[13px] uppercase italic'
        >
          <span className='font-fix'>{'Save mix'}</span>
        </Button>
        <Link className='text-accent' href='#'>
          <span className='font-fix'>{'Hello LeFto'}</span>
        </Link>
        <IconButton
          className='size-7'
          variant='primaryFilled'
          aria-label='profile'
        >
          {<PersonIcon height={14} />}
        </IconButton>
      </div>
    </header>
  );
};
