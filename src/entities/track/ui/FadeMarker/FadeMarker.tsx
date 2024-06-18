import { memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeMarkerProps } from './interfaces';

export const FadeMarker = ({ side, className, ...props }: FadeMarkerProps) => {
  return (
    <div
      className={cn(
        'flex h-[50%] w-[61px] flex-col items-center cursor-ew-resize group',
        {
          'left-[-30px]': side === 'right',
          'right-[-30px]': side === 'left',
        },
        className,
      )}
      {...props}
    />
  );
};

export const FadeMarkerMemoized = memo(FadeMarker);
