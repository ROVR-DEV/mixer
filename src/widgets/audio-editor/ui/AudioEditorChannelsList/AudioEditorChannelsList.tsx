'use client';

import { observer } from 'mobx-react-lite';
import { forwardRef, useCallback } from 'react';

import { usePlayer, useTimelineController } from '@/entities/audio-editor';
import {
  AddNewChannelButtonMemoized,
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';

import { AudioEditorChannelsListView } from '../AudioEditorChannelsListView';

import { AudioEditorChannelsListProps } from './interfaces';

const _AudioEditorChannelsList = forwardRef<
  HTMLDivElement,
  AudioEditorChannelsListProps
>(function AudioEditorChannelsList({ ...props }, ref) {
  const player = usePlayer();
  const timelineController = useTimelineController();

  const handleAddChannel = useCallback(() => player.addChannel(), [player]);

  return (
    <ChannelListMemoized ref={ref} {...props}>
      <AudioEditorChannelsListView />
      <ChannelListItemMemoized
        className='justify-center'
        disableBorder
        style={{ height: timelineController.trackHeight }}
      >
        <AddNewChannelButtonMemoized onClick={handleAddChannel} />
      </ChannelListItemMemoized>
    </ChannelListMemoized>
  );
});

export const AudioEditorChannelsList = observer(_AudioEditorChannelsList);
