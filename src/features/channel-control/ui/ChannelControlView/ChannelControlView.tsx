'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { ChannelControlMemoized } from '..';

import { ChannelControlViewProps } from './interfaces';

export const ChannelControlView = observer(function ChannelControlView({
  audioEditorManager,
  channel,
  ...props
}: ChannelControlViewProps) {
  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      audioEditorManager.removeChannel(channel.id);
    },
    [audioEditorManager, channel.id],
  );

  return (
    <ChannelControlMemoized
      channel={channel}
      isSelected={audioEditorManager.selectedChannelId === channel.id}
      onClickRemove={handleRemove}
      {...props}
    />
  );
});
