'use client';

import { observer } from 'mobx-react-lite';

import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  audioEditorManager,
  channel,
  ...props
}: ChannelListItemViewProps) {
  return (
    <ChannelListItemMemoized
      isSelected={audioEditorManager.selectedChannelId === channel.id}
      onClick={() => audioEditorManager.setSelectedChannel(channel.id)}
      {...props}
    />
  );
});
