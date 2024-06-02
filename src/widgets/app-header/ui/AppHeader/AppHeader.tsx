import Image from 'next/image';
import Link from 'next/link';

import { HEADER_LAYOUT } from '@/shared/config/sharedStyles';
import { cn } from '@/shared/lib';
import { Button, IconButton, Version } from '@/shared/ui';
import { PersonIcon, LogoImageRaw } from '@/shared/ui/assets';

import { AppHeaderProps } from './interfaces';

export const AppHeader = ({ className, ...props }: AppHeaderProps) => {
  return (
    <header className={cn(HEADER_LAYOUT, className)} {...props}>
      <Version className='col-start-1' />
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
    </header>
  );
};
