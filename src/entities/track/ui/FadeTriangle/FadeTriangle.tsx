import { memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeTriangleProps } from './interfaces';

export const FadeTriangle = ({
  side,
  variant = 'light',
  className,
  ...props
}: FadeTriangleProps) => {
  return (
    <div
      className={cn(
        'size-full ',
        {
          'bg-third-light/[0.32]': variant === 'light',
          'bg-third-darker/[0.32]': variant === 'dark',
          '[clip-path:polygon(100%_0%,_0%_0%,_0%_100%)]': side === 'left',
          '[clip-path:polygon(100%_0%,_0%_0%,_100%_100%)]': side === 'right',
        },
        className,
      )}
      {...props}
    />
  );
};

export const FadeTriangleMemoized = memo(FadeTriangle);
