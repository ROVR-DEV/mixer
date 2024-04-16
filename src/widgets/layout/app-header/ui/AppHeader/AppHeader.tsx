import Link from 'next/link';

import { cn } from '@/shared/lib/cn';
import { Button, IconButton } from '@/shared/ui';
import { PersonIcon, SaveMixIcon } from '@/shared/ui/assets';

import { AppHeaderProps } from './interfaces';

export const AppHeader = ({ className, ...props }: AppHeaderProps) => {
  return (
    <div
      className={cn(
        'flex h-16 items-center justify-end border-b border-b-secondary px-5 py-4',
        className,
      )}
      {...props}
    >
      <div className='flex items-center gap-5'>
        <Button>
          <SaveMixIcon />
        </Button>
        <Link className='text-accent' href='#'>
          {'Hello LeFto'}
        </Link>
        <IconButton variant='primaryFilled'>
          {<PersonIcon height={18} />}
        </IconButton>
      </div>
    </div>
  );
};
