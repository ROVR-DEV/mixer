'use client';

import { observer } from 'mobx-react-lite';

import {
  AddNewChannelButtonMemoized,
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';

import { ChannelControlMemoized } from '@/features/channel-control';

import { AudioEditorChannelsListProps } from './interfaces';

export const AudioEditorChannelsList = observer(
  function AudioEditorChannelsList({
    audioEditorManager,
    trackHeight,
    ...props
  }: AudioEditorChannelsListProps) {
    return (
      <ChannelListMemoized {...props}>
        {[...audioEditorManager.channels.values()].map((channel, index) => (
          <ChannelListItemMemoized
            key={`${channel.id}-channel`}
            style={{ height: trackHeight }}
            isSelected={audioEditorManager.selectedChannelId === channel.id}
            onClick={() => audioEditorManager.setSelectedChannel(channel.id)}
          >
            <ChannelControlMemoized
              channel={channel}
              number={index + 1}
              isSelected={audioEditorManager.selectedChannelId === channel.id}
              isAbleToRemove={index > 1}
              onClickRemove={(e) => {
                e.stopPropagation();
                audioEditorManager.removeChannel(channel.id);
              }}
            />
          </ChannelListItemMemoized>
        ))}
        <ChannelListItemMemoized
          className='justify-center'
          disableBorder
          style={{ height: trackHeight }}
        >
          <AddNewChannelButtonMemoized
            onClick={() => {
              audioEditorManager.addChannel();
            }}
          />
        </ChannelListItemMemoized>
      </ChannelListMemoized>
    );
  },
);
