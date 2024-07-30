'use client';

import { observer } from 'mobx-react-lite';

import { useAudioEditor } from '@/entities/audio-editor';

import {
  ChannelControlView,
  ChannelListItemView,
} from '@/features/channel-control';

import { AudioEditorChannelsListViewProps } from './interfaces';

export const AudioEditorChannelsListView = observer(
  function AudioEditorChannelsListView({
    itemClassName,
  }: AudioEditorChannelsListViewProps) {
    const audioEditor = useAudioEditor();

    return audioEditor.player.channels.map((channel, index) => (
      <ChannelListItemView
        className={itemClassName}
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
