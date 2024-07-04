'use client';

import { observer } from 'mobx-react-lite';

import { useTimelineController } from '@/entities/audio-editor';

import { ChannelListItemClickView } from '@/features/channel-control';

import { AudioEditorTracksView } from '../AudioEditorTracksView';

import { AudioEditorTracksListProps } from './interfaces';

export const AudioEditorTracksList = observer(function AudioEditorTracksList({
  player,
}: AudioEditorTracksListProps) {
  const timelineController = useTimelineController();

  return player.channelIds.map((channelId) => {
    const channel = player.channels.get(channelId)!;

    return (
      <ChannelListItemClickView
        key={`channel-${channel.id}-track-line`}
        className='relative py-1.5'
        channel={channel}
        style={{ height: timelineController.trackHeight }}
      >
        <AudioEditorTracksView channel={channel} player={player} />
      </ChannelListItemClickView>
    );
  });
});
