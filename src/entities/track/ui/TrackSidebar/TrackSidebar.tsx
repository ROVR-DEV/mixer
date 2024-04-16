import { cn } from '@/shared/lib/cn';

import { TrackListSidebarProps } from './interfaces';

export const TrackSidebar = ({
  className,
  ...props
}: TrackListSidebarProps) => {
  return (
    <div className={cn('border-r border-r-secondary', className)} {...props} />
  );
};
