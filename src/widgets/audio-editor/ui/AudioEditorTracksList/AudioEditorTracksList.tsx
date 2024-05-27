'use client';

import { observer } from 'mobx-react-lite';

import { ChannelListItemView } from '@/features/channel-control';

import { AudioEditorTracksView } from '../AudioEditorTracksView';

import { AudioEditorTracksListProps } from './interfaces';

export const AudioEditorTracksList = observer(function AudioEditorTracksList({
  audioEditorManager,
  tracksData,
}: AudioEditorTracksListProps) {
  return audioEditorManager.channelIds.map((channelId) => {
    const channel = audioEditorManager.channels.get(channelId)!;

    return (
      <ChannelListItemView
        key={`channel-track-line-${channel.id}`}
        className='relative'
        audioEditorManager={audioEditorManager}
        channel={channel}
      >
        <AudioEditorTracksView
          channel={channel}
          tracksData={tracksData}
          audioEditorManager={audioEditorManager}
        />
      </ChannelListItemView>
    );
  });
});
