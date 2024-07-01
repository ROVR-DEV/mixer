'use client';

import { observer } from 'mobx-react-lite';

import {
  ChannelControlView,
  ChannelListItemView,
} from '@/features/channel-control';

import { AudioEditorChannelsListViewProps } from './interfaces';

export const AudioEditorChannelsListView = observer(
  function AudioEditorChannelsListView({
    player,
  }: AudioEditorChannelsListViewProps) {
    return player.channelIds.map((channelId, index) => {
      const channel = player.channels.get(channelId)!;

      return (
        <ChannelListItemView
          key={`channel-${channel.id}`}
          player={player}
          channel={channel}
          leftPadding
          ignoreMuted
        >
          <ChannelControlView
            number={index + 1}
            isAbleToRemove={index > 1}
            player={player}
            channel={channel}
          />
        </ChannelListItemView>
      );
    });
  },
);
