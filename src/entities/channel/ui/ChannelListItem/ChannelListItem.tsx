import { memo } from 'react';

import { cn } from '@/shared/lib';

import { ChannelListItemProps } from './interfaces';

export const ChannelListItem = ({
  disableBorder,
  isSelected,
  isMuted,
  leftPadding,
  ignoreSelection,
  className,
  children,
  ...props
}: ChannelListItemProps) => {
  return (
    <div
      className={cn('py-1.5 h-24 flex items-center relative', className, {
        'border-b border-b-secondary': !disableBorder,
        'bg-primary-dark': !isMuted && !ignoreSelection && isSelected,
        'px-4': leftPadding,
      })}
      {...props}
    >
      {children}
      {isMuted && (
        <div className='pointer-events-none absolute left-0 top-0 size-full bg-third-light/10' />
      )}
    </div>
  );
};

export const ChannelListItemMemoized = memo(ChannelListItem);
