import { cn } from '@/shared/lib/cn';

import { TrackFloatingMenuGroupProps } from './interfaces';

export const TrackFloatingMenuGroup = ({
  className,
  ...props
}: TrackFloatingMenuGroupProps) => {
  return (
    <div
      className={cn('flex items-center gap-4 px-4 py-[10px]', className)}
      {...props}
    />
  );
};
