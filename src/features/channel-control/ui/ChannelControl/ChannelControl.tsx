import { observer } from 'mobx-react-lite';
import { memo } from 'react';

import { cn } from '@/shared/lib';
import { Badge, IconButton } from '@/shared/ui';
import {
  MuteChannelIcon,
  SoloChannelIcon,
  AutomationChannelIcon,
  CrossIcon,
} from '@/shared/ui/assets';

import { TrackChannelControlProps } from './interfaces';

export const ChannelControl = observer(function ChannelControl({
  channel,
  number,
  isAbleToRemove,
  onClickRemove,
  isSelected,
  className,
  ...props
}: TrackChannelControlProps) {
  const channelNumber = number.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return (
    <div
      className={cn('flex items-center gap-[10px] w-max', className)}
      {...props}
    >
      <Badge className='h-7 px-2' variant={isSelected ? 'filled' : 'default'}>
        <span className='text-[13px] uppercase italic font-fix'>
          <span>{'Channel '}</span>
          <span>{channelNumber}</span>
        </span>
      </Badge>
      <IconButton
        className='size-7'
        variant={channel.isMuted ? 'primaryFilled' : 'secondary'}
        aria-label='Mute\unmute this track'
        role='switch'
        aria-checked={channel.isMuted}
        onClick={(e) => {
          e.stopPropagation();
          channel.toggleMute();
        }}
      >
        <MuteChannelIcon />
      </IconButton>
      <IconButton
        className='size-7'
        variant={channel.isSolo ? 'primaryFilled' : 'secondary'}
        aria-label='Solo this track'
        role='switch'
        aria-checked={channel.isSolo}
        onClick={(e) => {
          e.stopPropagation();
          channel.toggleSolo();
        }}
      >
        <SoloChannelIcon />
      </IconButton>
      <IconButton
        className='size-7'
        variant='secondary'
        aria-label='Show/hide automation'
        // onClick={}
        disabled
      >
        <AutomationChannelIcon />
      </IconButton>
      {isAbleToRemove && (
        <IconButton
          className='size-7 border-error'
          variant='secondary'
          aria-label='Remove channel'
          onClick={onClickRemove}
        >
          <CrossIcon />
        </IconButton>
      )}
    </div>
  );
});

export const ChannelControlMemoized = memo(ChannelControl);
