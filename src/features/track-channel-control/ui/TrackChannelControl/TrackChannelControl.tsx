import { memo } from 'react';

import { cn } from '@/shared/lib/cn';
import { Badge, IconButton } from '@/shared/ui';
import {
  MuteChannelIcon,
  SingleChannelIcon,
  AutomationChannelIcon,
} from '@/shared/ui/assets';

import { TrackChannelControlProps } from './interfaces';

export const TrackChannelControl = ({
  number,
  className,
  ...props
}: TrackChannelControlProps) => {
  const channelNumber = number.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return (
    <div
      className={cn('flex items-center gap-[10px] w-max', className)}
      {...props}
    >
      <Badge className='h-7'>
        <span className='text-[13px] uppercase italic font-fix'>
          <span>{'Channel '}</span>
          <span>{channelNumber}</span>
        </span>
      </Badge>
      <IconButton
        className='size-7'
        variant='secondary'
        aria-label='Mute channel'
        role='switch'
        aria-checked='false'
      >
        <MuteChannelIcon />
      </IconButton>
      <IconButton
        className='size-7'
        variant='secondary'
        aria-label='Single channel'
        role='switch'
        aria-checked='false'
      >
        <SingleChannelIcon />
      </IconButton>
      <IconButton
        className='size-7'
        variant='secondary'
        aria-label='Show/hide automation'
      >
        <AutomationChannelIcon />
      </IconButton>
    </div>
  );
};

export const TrackChannelControlMemoized = memo(TrackChannelControl);
