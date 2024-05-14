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

export const TrackChannelControl = ({
  number,
  isAbleToRemove,
  isMuted,
  isSolo,
  onClickRemove,
  onClickSolo,
  onClickMute,
  isSelected,
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
      <Badge className='h-7 px-2' variant={isSelected ? 'filled' : 'default'}>
        <span className='text-[13px] uppercase italic font-fix'>
          <span>{'Channel '}</span>
          <span>{channelNumber}</span>
        </span>
      </Badge>
      <IconButton
        className='size-7'
        variant={isMuted ? 'primaryFilled' : 'secondary'}
        aria-label='Mute\unmute this track'
        role='switch'
        aria-checked={isMuted}
        onClick={onClickMute}
      >
        <MuteChannelIcon />
      </IconButton>
      <IconButton
        className='size-7'
        variant={isSolo ? 'primaryFilled' : 'secondary'}
        aria-label='Solo this track'
        role='switch'
        aria-checked={isSolo}
        onClick={onClickSolo}
      >
        <SoloChannelIcon />
      </IconButton>
      <IconButton
        className='size-7'
        variant='secondary'
        aria-label='Show/hide automation'
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
};

export const TrackChannelControlMemoized = memo(TrackChannelControl);
