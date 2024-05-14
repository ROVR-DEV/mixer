import { memo } from 'react';

import { cn } from '@/shared/lib';

import { TrackSidebarItemProps } from './interfaces';

export const TrackSidebarItem = ({
  disableBorder,
  isSelected,
  isMuted,
  className,
  children,
  ...props
}: TrackSidebarItemProps) => {
  return (
    <div
      className={cn('p-4 h-24 flex items-center relative', className, {
        'border-b border-b-secondary': !disableBorder,
        'bg-primary-dark': isSelected && !isMuted,
      })}
      {...props}
    >
      {children}
      {isMuted && (
        <div className='absolute left-0 top-0 size-full bg-third-light/10' />
      )}
    </div>
  );
};

export const TrackSidebarItemMemoized = memo(TrackSidebarItem);
