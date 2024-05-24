'use client';

import { observer } from 'mobx-react-lite';

import { TRACK_HEIGHT } from '@/entities/audio-editor';
import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  audioEditorManager,
  channel,
  ...props
}: ChannelListItemViewProps) {
  return (
    <ChannelListItemMemoized
      style={{ height: TRACK_HEIGHT }}
      isSelected={audioEditorManager.selectedChannelId === channel.id}
      onClick={() => audioEditorManager.setSelectedChannel(channel.id)}
      {...props}
    />
  );
});
