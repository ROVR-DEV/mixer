import { memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeMarkerProps } from './interfaces';

export const FadeMarker = ({ side, className, ...props }: FadeMarkerProps) => {
  return (
    <div
      className={cn(
        'flex h-[calc(100%+5px)] min-w-[21px] flex-col items-center cursor-ew-resize group',
        {
          'left-[-10px]': side === 'right',
          'right-[-10px]': side === 'left',
        },
        className,
      )}
      {...props}
    ></div>
  );
};

export const FadeMarkerMemoized = memo(FadeMarker);
