import { memo } from 'react';

import { cn } from '@/shared/lib';

import { TrackSidebarItemProps } from './interfaces';

export const TrackSidebarItem = ({
  disableBorder,
  isSelected,
  translucentBackgroundWhenSelected,
  className,
  ...props
}: TrackSidebarItemProps) => {
  return (
    <div
      className={cn('p-4 h-24 flex items-center', className, {
        'border-b border-b-secondary': !disableBorder,
        'bg-primary-dark/50': isSelected && translucentBackgroundWhenSelected,
        'bg-primary-dark': isSelected && !translucentBackgroundWhenSelected,
      })}
      {...props}
    />
  );
};

export const TrackSidebarItemMemoized = memo(TrackSidebarItem);
