'use client';

import { observer } from 'mobx-react-lite';
import { forwardRef, useCallback } from 'react';

import {
  useAudioEditorManager,
  useTimelineController,
} from '@/entities/audio-editor';
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
  const audioEditorManager = useAudioEditorManager();
  const timelineController = useTimelineController();

  const handleAddChannel = useCallback(
    () => audioEditorManager.addChannel(),
    [audioEditorManager],
  );

  return (
    <ChannelListMemoized ref={ref} {...props}>
      <AudioEditorChannelsListView audioEditorManager={audioEditorManager} />
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
