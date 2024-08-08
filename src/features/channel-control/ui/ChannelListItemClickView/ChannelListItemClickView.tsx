import { useCallback } from 'react';

import { useIsMouseClickStartsOnThisSpecificElement } from '@/shared/lib';

import { useAudioEditor } from '@/entities/audio-editor';

import { ChannelListItemClickViewProps } from './interfaces';

export const ChannelListItemClickView = ({
  channel,
  ...props
}: ChannelListItemClickViewProps) => {
  const audioEditor = useAudioEditor();

  const { onClick: onElementClick, onMouseDown: onElementMouseDown } =
    useIsMouseClickStartsOnThisSpecificElement();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onElementClick?.(e)) {
        return;
      }

      if (audioEditor.tool !== 'cursor') {
        return;
      }

      audioEditor.selectedChannel = channel;
    },
    [audioEditor, channel, onElementClick],
  );

  return (
    <div onClick={handleClick} onMouseDown={onElementMouseDown} {...props} />
  );
};
