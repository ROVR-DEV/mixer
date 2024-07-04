'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { usePlayer, useTimelineController } from '@/entities/audio-editor';

import { ChannelListItemView } from '@/features/channel-control';

export const TimelineChannelsList = observer(function TimelineChannelsList() {
  const player = usePlayer();
  const timelineController = useTimelineController();

  return player.channelIds.map((channelId) => {
    const channel = player.channels.get(channelId)!;

    return (
      <ChannelListItemView
        key={`channel-${channel.id}-track-line-background`}
        className={cn('relative pointer-events-none', {
          'z-10': player.isChannelMuted(channel),
        })}
        player={player}
        channel={channel}
        style={{ height: timelineController.trackHeight }}
      />
    );
  });
});
