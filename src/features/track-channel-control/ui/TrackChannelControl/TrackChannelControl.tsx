import { memo } from 'react';

import { cn } from '@/shared/lib/cn';
import { Badge, IconButton } from '@/shared/ui';
import {
  Channel01Icon,
  MuteChannelIcon,
  SingleChannelIcon,
  AutomationChannelIcon,
} from '@/shared/ui/assets';

import { TrackChannelControlProps } from './interfaces';

export const TrackChannelControl = ({
  className,
  ...props
}: TrackChannelControlProps) => {
  return (
    <div
      className={cn('flex items-center gap-[10px] w-max', className)}
      {...props}
    >
      <Badge>
        <Channel01Icon />
      </Badge>
      <IconButton
        variant='secondary'
        aria-label='Mute channel'
        role='switch'
        aria-checked='false'
      >
        <MuteChannelIcon />
      </IconButton>
      <IconButton
        variant='secondary'
        aria-label='Single channel'
        role='switch'
        aria-checked='false'
      >
        <SingleChannelIcon />
      </IconButton>
      <IconButton variant='secondary' aria-label='Show/hide automation'>
        <AutomationChannelIcon />
      </IconButton>
    </div>
  );
};

export const TrackChannelControlMemoized = memo(TrackChannelControl);
