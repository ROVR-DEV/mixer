'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  audioEditorManager,
  channel,
  ignoreSelection,
  ...props
}: ChannelListItemViewProps) {
  const handleClick = useMemo(
    () =>
      ignoreSelection
        ? undefined
        : () => audioEditorManager.setSelectedChannel(channel.id),
    [audioEditorManager, channel.id, ignoreSelection],
  );

  return (
    <ChannelListItemMemoized
      isSelected={audioEditorManager.selectedChannelId === channel.id}
      onClick={handleClick}
      ignoreSelection={ignoreSelection}
      {...props}
    />
  );
});
