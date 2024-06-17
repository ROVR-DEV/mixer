'use client';

import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';

import { EditBadge } from '../EditBadge';
import { TrackTitle } from '../TrackTitle';

import { TrackCardProps } from './interfaces';

export const TrackCard = forwardRef<HTMLDivElement, TrackCardProps>(
  function TrackCard(
    {
      track,
      isSelected,
      isSolo,
      hideTitle = false,
      waveformComponent,
      color,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          'relative grid grid-rows-[18px_auto_18px] h-[84px] box-content border rounded-md bg-primary',
          className,
          {
            'bg-accent !text-primary': isSelected,
            '!border-accent': isSolo || isSelected,
            'border-third-dark text-third': !color,
            'grid-rows-[0_auto_0]': hideTitle,
          },
        )}
        style={{
          color: color ?? '',
          borderColor: color ?? '',
        }}
        ref={ref}
        {...props}
      >
        <EditBadge
          className={cn('absolute hidden left-1.5 top-1.5 z-10', {
            flex: isSelected,
          })}
        />
        <div className='row-start-2 overflow-hidden'>{waveformComponent}</div>
        {!hideTitle && (
          <TrackTitle className='row-start-3 pl-1' track={track} />
        )}
        <div className='absolute z-10 row-span-full size-full'>{children}</div>
      </div>
    );
  },
);

export const TrackCardMemoized = memo(TrackCard);
