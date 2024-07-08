'use client';

import { observer } from 'mobx-react-lite';

import { useAudioEditor } from '@/entities/audio-editor';

import {
  ChannelControlView,
  ChannelListItemView,
} from '@/features/channel-control';

export const AudioEditorChannelsListView = observer(
  function AudioEditorChannelsListView() {
    const audioEditor = useAudioEditor();

    return audioEditor.player.channels.map((channel, index) => (
      <ChannelListItemView
        key={`channel-${channel.id}`}
        channel={channel}
        leftPadding
        ignoreMuted
      >
        <ChannelControlView
          number={index + 1}
          isAbleToRemove={index > 1}
          channel={channel}
        />
      </ChannelListItemView>
    ));
  },
);
