import { cn } from '@/shared/lib/cn';

import { TrackSidebarItemProps } from './interfaces';

export const TrackSidebarItem = ({
  disableBorder,
  className,
  ...props
}: TrackSidebarItemProps) => {
  return (
    <div
      className={cn('px-6 py-4 h-24 flex items-center', className, {
        'border-b border-b-secondary': !disableBorder,
      })}
      {...props}
    />
  );
};
