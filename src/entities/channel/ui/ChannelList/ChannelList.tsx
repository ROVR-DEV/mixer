import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';

import { ChannelListProps } from './interfaces';

export const ChannelList = forwardRef<HTMLDivElement, ChannelListProps>(
  function ChannelsList({ className, ...props }, ref) {
    return (
      <div
        className={cn('border-r border-r-secondary', className)}
        ref={ref}
        {...props}
      />
    );
  },
);

export const ChannelListMemoized = memo(ChannelList);
