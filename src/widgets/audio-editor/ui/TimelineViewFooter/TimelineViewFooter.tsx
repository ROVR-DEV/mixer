import { memo } from 'react';

import { cn } from '@/shared/lib';

import { SIDEBAR_WIDTH } from '@/entities/audio-editor';

import { TimelineScrollView } from '@/features/timeline';

import { TimelineViewFooterProps } from './interfaces';

export const TimelineViewFooter = ({
  className,
  ...props
}: TimelineViewFooterProps) => {
  return (
    <div
      className={cn('grid grow', className)}
      style={{
        gridTemplateColumns: `${SIDEBAR_WIDTH}px auto`,
      }}
      {...props}
    >
      <TimelineScrollView className='col-start-2' />
    </div>
  );
};

export const TimelineViewFooterMemoized = memo(TimelineViewFooter);
