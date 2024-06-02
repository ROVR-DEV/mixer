import { cn } from '@/shared/lib';

import { VersionProps } from './interfaces';

export const Version = ({ className, ...props }: VersionProps) => {
  return (
    <div className={cn('text-third', className)} {...props}>
      {process.env.version}
    </div>
  );
};
