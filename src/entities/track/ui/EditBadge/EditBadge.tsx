import { cn } from '@/shared/lib';
import { Badge } from '@/shared/ui';

import { EditBadgeProps } from './interfaces';

export const EditBadge = ({ className, ...props }: EditBadgeProps) => {
  return (
    <Badge
      variant='accent'
      className={cn(
        'w-16 h-[22px] bg-accent/80 rounded-md uppercase p-0 pt-[3px] text-[12px] font-bold items-center justify-center flex',
        className,
      )}
      {...props}
    >
      {'Edit'}
    </Badge>
  );
};
