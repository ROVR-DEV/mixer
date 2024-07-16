'use client';

import { offset } from '@floating-ui/react';
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
      editPopoverContent,
      isEditingName,
      onNameEdited,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          '@container relative grid grid-rows-[18px_auto_18px] grid-cols-1 border rounded-lg bg-primary',
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
        <Popover placement='bottom-start' middleware={[offset(5)]}>
          <PopoverTrigger
            className={cn(
              '@[128px]:left-7 row-start-1 absolute hidden items-center h-max left-3.5 top-0 bottom-0 my-auto cursor-pointer z-50 transition-[left] rounded-md',
              {
                '@[96px]:flex': isSelected,
              },
            )}
          >
            <EditBadge />
          </PopoverTrigger>
          <PopoverContent className='z-20 w-[213px] overflow-hidden rounded-lg border border-accent bg-primary'>
            {editPopoverContent}
          </PopoverContent>
        </Popover>

        <div className='row-start-2 w-full'>{waveformComponent}</div>
        {!hideTitle && (
          <TrackTitle
            className='z-20 row-start-3 pl-1'
            track={track}
            isEditing={isEditingName}
            onEdited={onNameEdited}
          />
        )}

        <div className='absolute z-10 row-span-full size-full overflow-hidden rounded-lg'>
          {children}
        </div>
      </div>
    );
  },
);

export const TrackCardMemoized = memo(TrackCard);
