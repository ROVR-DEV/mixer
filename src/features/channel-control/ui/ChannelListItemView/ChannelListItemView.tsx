'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  player,
  channel,
  ignoreSelection,
  ...props
}: ChannelListItemViewProps) {
  const handleClick = useMemo(
    () =>
      ignoreSelection ? undefined : () => player.setSelectedChannel(channel.id),
    [player, channel.id, ignoreSelection],
  );

  return (
    <ChannelListItemMemoized
      isSelected={player.selectedChannelId === channel.id}
      onClick={handleClick}
      ignoreSelection={ignoreSelection}
      {...props}
    />
  );
});
