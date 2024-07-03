import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';

import { TrimMarkerProps } from './interfaces';

export const TrimMarker = forwardRef<HTMLDivElement, TrimMarkerProps>(
  function TrimMaker({ trimSide, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('h-1/2 w-4 bg-transparent', className, {
          'cursor-trim-left': trimSide === 'left',
          'cursor-trim-right': trimSide === 'right',
        })}
        {...props}
      />
    );
  },
);

export const TrimMakerMemoized =
  memo<React.PropsWithChildren<TrimMarkerProps>>(TrimMarker);
