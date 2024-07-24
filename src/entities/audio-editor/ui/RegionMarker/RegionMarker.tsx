import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { RegionProps } from './interfaces';

export const RegionMarker = forwardRef<HTMLDivElement, RegionProps>(
  function RegionMarker({ isActive, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        <div
          className={cn('bg-third-darker/70 h-full min-h-full', {
            'bg-[#FF6B00B2]': isActive,
          })}
        />
        <div
          className={cn('pointer-events-none h-screen bg-white/5', {
            hidden: !isActive,
          })}
        />
      </div>
    );
  },
);
