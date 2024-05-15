import { memo } from 'react';

import { cn } from '@/shared/lib';

import { ChannelListProps } from './interfaces';

export const ChannelList = ({ className, ...props }: ChannelListProps) => {
  return (
    <div className={cn('border-r border-r-secondary', className)} {...props} />
  );
};

export const ChannelListMemoized = memo(ChannelList);
