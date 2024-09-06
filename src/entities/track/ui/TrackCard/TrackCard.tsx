'use client';

import {
  detectOverflow,
  flip,
  MiddlewareState,
  offset,
} from '@floating-ui/react';
import { forwardRef, memo, useMemo, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';
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
      hideEditButton,
      contextMenuPosition,
      contextMenuContent,
      popoverBoundary,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const popoverTriggerRef = useRef<HTMLButtonElement | null>(null);

    const overflowMiddleware = useMemo(
      () => ({
        name: 'overflowMiddleware',
        async fn(state: MiddlewareState): Promise<Partial<MiddlewareState>> {
          if (popoverBoundary === undefined) {
            return {};
          }

          const overflow = await detectOverflow(state, {
            boundary: popoverBoundary,
          });

          if (overflow.left > 0) {
            popoverTriggerRef.current?.click();
          }

          return {};
        },
      }),
      [popoverBoundary],
    );

    const memoizedStyle = useMemo(
      () => ({
        color: color ?? '',
        borderColor: color ?? '',
        ...style,
      }),
      [color, style],
    );

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
        style={memoizedStyle}
        ref={ref}
        {...props}
      >
        <div className='row-start-2 w-full py-px'>{waveformComponent}</div>

        {!hideTitle && (
          <TrackTitle
            className={cn('row-start-3 px-1', {
              'z-20': isEditingName,
            })}
            track={track}
            isEditing={isEditingName}
            onEdited={onNameEdited}
          />
        )}

        <div className='absolute -left-px -top-px z-10 row-span-full size-[calc(100%_+_2px)] overflow-hidden rounded-lg'>
          {children}
        </div>

        <Popover
          placement='bottom-start'
          middleware={[flip({ padding: 5 }), offset(5), overflowMiddleware]}
        >
          <PopoverTrigger
            ref={popoverTriggerRef}
            className={cn(
              '@[128px]:left-7 row-start-1 absolute hidden items-center h-max left-3.5 top-0 bottom-0 my-auto cursor-pointer z-50 transition-[left] rounded-md',
              {
                '@[96px]:flex': isSelected && !hideEditButton,
              },
            )}
            aria-label='Edit track menu'
            title='Edit track menu'
            onClick={preventAll}
            onMouseDown={preventAll}
            onMouseUp={preventAll}
          >
            <EditBadge />
          </PopoverTrigger>
          <PopoverContent
            className='z-[60]'
            onMouseDown={preventAll}
            onMouseUp={preventAll}
          >
            {editPopoverContent}
          </PopoverContent>
        </Popover>

        <Popover open={!!contextMenuPosition}>
          <PopoverContent
            className='z-[60]'
            onMouseDown={preventAll}
            onMouseUp={preventAll}
            style={{
              left: contextMenuPosition?.x,
              top: contextMenuPosition?.y,
            }}
          >
            {contextMenuContent}
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

export const TrackCardMemoized = memo(TrackCard);
