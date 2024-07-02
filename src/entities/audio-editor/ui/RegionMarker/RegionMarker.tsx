import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { RegionProps } from './interfaces';

export const RegionMarker = forwardRef<HTMLDivElement, RegionProps>(
  function RegionMarker({ markerHeight = 12, isActive, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        <div
          className={cn('bg-third-darker/70', {
            'bg-[#FF6B00B2]': isActive,
          })}
          style={{ height: markerHeight }}
        />
        <div className='h-screen bg-white/5' />
      </div>
    );
  },
);
