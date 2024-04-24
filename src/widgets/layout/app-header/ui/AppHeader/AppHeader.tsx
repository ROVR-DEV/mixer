import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';
import { Button, IconButton } from '@/shared/ui';
import { PersonIcon, LogoImageRaw } from '@/shared/ui/assets';

import { AppHeaderProps } from './interfaces';

export const AppHeader = ({ className, ...props }: AppHeaderProps) => {
  return (
    <header
      className={cn(
        'grid grid-rows-1 grid-cols-[1fr_auto_1fr] h-16 items-center justify-end border-b border-b-secondary px-6 py-4',
        className,
      )}
      {...props}
    >
      <Image
        className='col-start-2'
        src={LogoImageRaw}
        alt='Rovr logo'
        priority
      />
      <div className='col-start-3 flex w-[450px] items-center justify-between justify-self-end'>
        <Button
          aria-label='Save mix'
          className='h-7 text-[13px] uppercase italic'
        >
          <span className='font-fix'>{'Save mix'}</span>
        </Button>
        <div className='flex items-center gap-5'>
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
      </div>
    </header>
  );
};
