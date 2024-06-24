'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { ChannelControlMemoized } from '..';

import { ChannelControlViewProps } from './interfaces';

export const ChannelControlView = observer(function ChannelControlView({
  player,
  channel,
  ...props
}: ChannelControlViewProps) {
  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      player.removeChannel(channel.id);
    },
    [player, channel.id],
  );

  return (
    <ChannelControlMemoized
      channel={channel}
      isSelected={player.selectedChannelId === channel.id}
      onClickRemove={handleRemove}
      {...props}
    />
  );
});
