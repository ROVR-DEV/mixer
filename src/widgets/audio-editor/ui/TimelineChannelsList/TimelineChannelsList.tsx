'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { usePlayer, useTimeline } from '@/entities/audio-editor';

import { ChannelListItemView } from '@/features/channel-control';

import { TimelineChannelsListProps } from './interfaces';

export const TimelineChannelsList = observer(function TimelineChannelsList({
  itemClassName,
}: TimelineChannelsListProps) {
  const player = usePlayer();
  const timeline = useTimeline();

  return player.channels.map((channel) => (
    <ChannelListItemView
      key={`channel-${channel.id}-track-line-background`}
      className={cn('relative pointer-events-none', itemClassName, {
        'z-10': player.isChannelMuted(channel),
      })}
      channel={channel}
      style={{ height: timeline.trackHeight }}
    />
  ));
});
