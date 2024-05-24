'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import {
  AddNewChannelButtonMemoized,
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';

import { AudioEditorChannelsListView } from '../AudioEditorChannelsListView';

import { AudioEditorChannelsListProps } from './interfaces';

export const AudioEditorChannelsList = observer(
  function AudioEditorChannelsList({
    audioEditorManager,
    trackHeight,
    ...props
  }: AudioEditorChannelsListProps) {
    const handleAddChannel = useCallback(
      () => audioEditorManager.addChannel(),
      [audioEditorManager],
    );

    return (
      <ChannelListMemoized {...props}>
        <AudioEditorChannelsListView audioEditorManager={audioEditorManager} />
        <ChannelListItemMemoized
          className='justify-center'
          disableBorder
          style={{ height: trackHeight }}
        >
          <AddNewChannelButtonMemoized onClick={handleAddChannel} />
        </ChannelListItemMemoized>
      </ChannelListMemoized>
    );
  },
);
