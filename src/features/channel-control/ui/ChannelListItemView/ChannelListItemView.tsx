'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useIsMouseClickStartsOnThisSpecificElement } from '@/shared/lib';

import { useAudioEditor, useTimeline } from '@/entities/audio-editor';
import { ChannelListItemMemoized } from '@/entities/channel';

import { ChannelListItemViewProps } from './interfaces';

export const ChannelListItemView = observer(function ChannelListItemView({
  channel,
  ignoreSelection,
  ignoreMuted,
  ...props
}: ChannelListItemViewProps) {
  const audioEditor = useAudioEditor();
  const timeline = useTimeline();

  const { onClick: onElementClick, onMouseDown: onElementMouseDown } =
    useIsMouseClickStartsOnThisSpecificElement();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onElementClick?.(e)) {
        return;
      }

      if (ignoreSelection) {
        return;
      }

      if (audioEditor.tool !== 'cursor') {
        return;
      }

      audioEditor.selectedChannel = channel;
    },
    [onElementClick, ignoreSelection, audioEditor, channel],
  );

  return (
    <ChannelListItemMemoized
      isSelected={audioEditor.selectedChannel === channel}
      onClick={handleClick}
      onMouseDown={onElementMouseDown}
      ignoreSelection={ignoreSelection}
      isMuted={!ignoreMuted && audioEditor.player.isChannelMuted(channel)}
      style={{ height: timeline.trackHeight }}
      {...props}
    />
  );
});
