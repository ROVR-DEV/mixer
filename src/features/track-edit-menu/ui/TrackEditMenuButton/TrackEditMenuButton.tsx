import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';

import { TrackEditMenuButtonProps } from './interfaces';

export const TrackEditMenuButton = ({
  className,
  ...props
}: TrackEditMenuButtonProps) => {
  return (
    <Button
      className={cn(
        'min-h-[68px] rounded-none bg-transparent text-accent focus:bg-accent focus:text-primary outline-none hover:bg-accent hover:text-primary',
        className,
      )}
      {...props}
    />
  );
};
