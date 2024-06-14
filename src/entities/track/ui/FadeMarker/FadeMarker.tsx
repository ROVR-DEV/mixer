import { memo } from 'react';

import { cn } from '@/shared/lib';

import { FadeMarkerProps } from './interfaces';

export const FadeMarker = ({
  side,
  hideStick,
  className,
  ...props
}: FadeMarkerProps) => {
  return (
    <div
      className={cn(
        'flex h-[calc(100%+5px)] w-[11px] flex-col items-center cursor-ew-resize group',
        {
          'left-[-5px]': side === 'right',
          'right-[-5px]': side === 'left',
        },
        className,
      )}
      {...props}
    >
      <div className='absolute top-[-2px] hidden aspect-square size-[15px] min-h-[15px] min-w-[15px] rounded-full bg-white/60 group-hover:block'></div>
      <div className='pointer-events-none z-10 aspect-square size-[11px] min-h-[11px] min-w-[11px] rounded-full border border-primary bg-accent' />
      {!hideStick && (
        <div className='pointer-events-none h-full w-px bg-accent' />
      )}
    </div>
  );
};

export const FadeMarkerMemoized = memo(FadeMarker);
