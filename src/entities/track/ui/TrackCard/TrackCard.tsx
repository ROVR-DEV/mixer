'use client';

import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui';

import { EditBadge } from '../EditBadge';
import { TrackTitle } from '../TrackTitle';

import { TrackCardProps } from './interfaces';

export const TrackCard = forwardRef<HTMLDivElement, TrackCardProps>(
  function TrackCard(
    {
      track,
      waveformComponent,
      isSelected,
      isSolo,
      color,
      hideTitle = false,
      editPopoverContent: EditPopoverContent,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          'relative grid grid-rows-[18px_auto_18px] h-[84px] box-content border rounded-lg bg-primary',
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
        <Popover placement='bottom-start'>
          <PopoverTrigger
            className={cn(
              'absolute hidden items-center left-7 top-0 bottom-0 m-auto cursor-pointer z-20',
              {
                flex: isSelected,
              },
            )}
          >
            <EditBadge />
          </PopoverTrigger>
          <PopoverContent className='z-20 w-[213px] overflow-hidden rounded-lg border border-accent bg-primary'>
            {EditPopoverContent && <EditPopoverContent />}
          </PopoverContent>
        </Popover>

        <div className='row-start-2 overflow-hidden'>{waveformComponent}</div>
        {!hideTitle && (
          <TrackTitle className='row-start-3 pl-1' track={track} />
        )}
        <div className='absolute z-10 row-span-full size-full overflow-hidden rounded-lg'>
          {children}
        </div>
      </div>
    );
  },
);

export const TrackCardMemoized = memo(TrackCard);
