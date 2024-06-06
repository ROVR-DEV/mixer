import { memo } from 'react';

import { cn } from '@/shared/lib';

import { TimelineScrollView } from '@/features/timeline';

import { TimelineViewFooterProps } from './interfaces';

export const TimelineViewFooter = ({
  className,
  ...props
}: TimelineViewFooterProps) => {
  return (
    <div
      className={cn('grid grow grid-cols-[296px_auto]', className)}
      {...props}
    >
      <TimelineScrollView className='col-start-2' />
    </div>
  );
};

export const TimelineViewFooterMemoized = memo(TimelineViewFooter);
