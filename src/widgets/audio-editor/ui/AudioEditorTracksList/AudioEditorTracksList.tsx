'use client';

import { observer } from 'mobx-react-lite';

import { useTimeline } from '@/entities/audio-editor';

import { ChannelListItemClickView } from '@/features/channel-control';

import { AudioEditorTracksView } from '../AudioEditorTracksView';

import { AudioEditorTracksListProps } from './interfaces';

export const AudioEditorTracksList = observer(function AudioEditorTracksList({
  player,
}: AudioEditorTracksListProps) {
  const timeline = useTimeline();

  return player.channels.map((channel) => (
    <ChannelListItemClickView
      key={`channel-${channel.id}-track-line`}
      className='relative py-1.5'
      channel={channel}
      style={{ height: timeline.trackHeight }}
    >
      <AudioEditorTracksView channel={channel} player={player} />
    </ChannelListItemClickView>
  ));
});
