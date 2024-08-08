import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeMarkerProps } from './interfaces';

export const FadeMarker = forwardRef<HTMLDivElement, FadeMarkerProps>(
  function FadeMaker({ side, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-[50%] w-[61px] flex-col items-center cursor-ew-resize group',
          {
            'left-[-20px]': side === 'right',
            'right-[-20px]': side === 'left',
          },
          className,
        )}
        {...props}
      />
    );
  },
);

export const FadeMarkerMemoized = memo(FadeMarker);
