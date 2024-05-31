'use client';

import { observer } from 'mobx-react-lite';

import { useTimelineController } from '@/entities/audio-editor';

import { ChannelListItemView } from '@/features/channel-control';

import { AudioEditorTracksView } from '../AudioEditorTracksView';

import { AudioEditorTracksListProps } from './interfaces';

export const AudioEditorTracksList = observer(function AudioEditorTracksList({
  audioEditorManager,
}: AudioEditorTracksListProps) {
  const timelineController = useTimelineController();

  return audioEditorManager.channelIds.map((channelId) => {
    const channel = audioEditorManager.channels.get(channelId)!;

    return (
      <ChannelListItemView
        key={`channel-track-line-${channel.id}`}
        className='relative'
        audioEditorManager={audioEditorManager}
        channel={channel}
        style={{ height: timelineController.trackHeight }}
      >
        <AudioEditorTracksView
          channel={channel}
          audioEditorManager={audioEditorManager}
        />
      </ChannelListItemView>
    );
  });
});
