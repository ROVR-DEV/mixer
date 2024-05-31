'use client';

import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';
import { Badge, Button } from '@/shared/ui';

import { TrackCardProps } from './interfaces';

export const TrackCard = forwardRef<HTMLDivElement, TrackCardProps>(
  function TrackCard(
    {
      track,
      className,
      isSelected,
      isSolo,
      onEdit,
      waveformComponent,
      ...props
    },
    ref,
  ) {
    const handleClickEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onEdit();
    };

    return (
      <div
        className={cn(
          'relative grid grid-rows-[18px_auto_18px] h-[84px] border transition-colors border-third-dark text-third rounded-md bg-primary',
          className,
          { 'bg-accent !text-primary': isSelected },
          { 'border-accent': isSolo || isSelected },
        )}
        ref={ref}
        {...props}
      >
        <Button
          className={cn('absolute hidden left-1.5 top-1.5 p-0', {
            flex: isSelected,
          })}
          onClick={handleClickEdit}
        >
          <Badge
            variant='inverse'
            className={cn(
              'w-16 h-[22px] z-10 bg-accent/80 rounded-md uppercase p-0 pt-[3px] text-[12px] font-bold items-center justify-center  flex',
            )}
          >
            {'Edit'}
          </Badge>
        </Button>
        <div className='row-start-2 overflow-hidden'>{waveformComponent}</div>
        <span className='row-start-3 mt-auto overflow-hidden text-ellipsis text-nowrap pl-1 text-[12px]'>
          <span className='font-bold'>{`${track.title} | ${track.artist} `}</span>
          <span className=''>{`(${track.duration})`}</span>
        </span>
      </div>
    );
  },
);

export const TrackCardMemoized = memo(TrackCard);
