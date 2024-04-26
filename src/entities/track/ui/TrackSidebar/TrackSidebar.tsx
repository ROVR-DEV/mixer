import { memo } from 'react';

import { cn } from '@/shared/lib';

import { TrackListSidebarProps } from './interfaces';

export const TrackSidebar = ({
  className,
  ...props
}: TrackListSidebarProps) => {
  return (
    <div className={cn('border-r border-r-secondary', className)} {...props} />
  );
};

export const TrackSidebarMemoized = memo(TrackSidebar);
