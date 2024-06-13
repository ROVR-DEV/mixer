import { memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeTriangleProps } from './interfaces';

export const FadeTriangle = ({
  side,
  className,
  ...props
}: FadeTriangleProps) => {
  return (
    <div
      className={cn(
        'size-full bg-third-light/40',
        {
          '[clip-path:polygon(0%_100%,_100%_0%,_100%_100%)]': side === 'left',
          '[clip-path:polygon(0%_100%,_0%_0%,_100%_100%)]': side === 'right',
        },
        className,
      )}
      {...props}
    />
  );
};

export const FadeTriangleMemoized = memo(FadeTriangle);
