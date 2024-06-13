import { memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeMarkerProps } from './interfaces';

export const FadeMarker = ({ side, className, ...props }: FadeMarkerProps) => {
  return (
    <div
      className={cn(
        'flex h-[calc(100%+5px)] w-[11px] flex-col items-center',
        {
          'left-[-5px]': side === 'right',
          'right-[-5px]': side === 'left',
        },
        className,
      )}
      {...props}
    >
      <div className='pointer-events-none aspect-square size-[11px] min-h-[11px] min-w-[11px] rounded-full border border-primary bg-accent' />
      <div className='pointer-events-none h-full w-px bg-accent' />
    </div>
  );
};

export const FadeMarkerMemoized = memo(FadeMarker);
