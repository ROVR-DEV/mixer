'use client';

import { observer } from 'mobx-react-lite';

import {
  ChannelControlView,
  ChannelListItemView,
} from '@/features/channel-control';

import { AudioEditorChannelsListViewProps } from './interfaces';

export const AudioEditorChannelsListView = observer(
  function AudioEditorChannelsListView({
    audioEditorManager,
  }: AudioEditorChannelsListViewProps) {
    return audioEditorManager.channelIds.map((channelId, index) => {
      const channel = audioEditorManager.channels.get(channelId)!;

      return (
        <ChannelListItemView
          key={`channel-${channel.id}`}
          audioEditorManager={audioEditorManager}
          channel={channel}
          leftPadding
        >
          <ChannelControlView
            number={index + 1}
            isAbleToRemove={index > 1}
            audioEditorManager={audioEditorManager}
            channel={channel}
          />
        </ChannelListItemView>
      );
    });
  },
);
