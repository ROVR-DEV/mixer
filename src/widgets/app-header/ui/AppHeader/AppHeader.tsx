import Image from 'next/image';

import { HEADER_LAYOUT } from '@/shared/config/sharedStyles';
import { cn } from '@/shared/lib';
import { Version } from '@/shared/ui';
import { LogoImageRaw } from '@/shared/ui/assets';

import { RightControlPanel } from '../RightControlPanel';

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
      <RightControlPanel className='col-start-3 w-[450px]' />
    </header>
  );
};
