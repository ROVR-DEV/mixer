'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { cn } from '@/shared/lib';
import {
  Badge,
  IconButton,
  AutomationChannelIcon,
  RemoveButton,
} from '@/shared/ui';

import { formatChannelNumber } from '@/entities/channel';

import { MuteButtonView } from '../MuteButtonView';
import { SoloButtonView } from '../SoloButtonView';

import { ChannelControlProps } from './interfaces';

export const ChannelControl = observer(function ChannelControl({
  channel,
  number,
  isAbleToRemove,
  onClickRemove,
  isSelected,
  className,
  ...props
}: ChannelControlProps) {
  const channelNumber = useMemo(() => formatChannelNumber(number), [number]);

  return (
    <div
      className={cn('flex items-center gap-[10px] w-max', className)}
      {...props}
    >
      <Badge
        className='h-7 px-2'
        role='button'
        aria-pressed={isSelected}
        title='Select channel'
        variant={isSelected ? 'filled' : 'default'}
      >
        <span className='text-[13px] uppercase italic font-fix'>
          <span>{'Channel '}</span>
          <span>{channelNumber}</span>
        </span>
      </Badge>
      <MuteButtonView channel={channel} />
      <SoloButtonView channel={channel} />
      <IconButton
        className='size-7'
        variant='secondary'
        aria-label='Show/hide automation'
        title='Automation'
        // onClick={}
        disabled
      >
        <AutomationChannelIcon />
      </IconButton>
      {isAbleToRemove && (
        <RemoveButton aria-label='Remove channel' onClick={onClickRemove} />
      )}
    </div>
  );
});
