'use client';

import { observer } from 'mobx-react-lite';

import { ChannelListItemMemoized } from '@/entities/channel';

import { AudioEditorTrackLine } from '../AudioEditorTrackLine';

import { AudioEditorTracksListProps } from './interfaces';

export const AudioEditorTracksList = observer(function AudioEditorTracksList({
  audioEditorManager,
  tracksData,
}: AudioEditorTracksListProps) {
  return [...audioEditorManager.channels.values()].map((channel) => (
    <ChannelListItemMemoized
      key={`${channel.id}-track`}
      className='relative'
      isSelected={audioEditorManager.selectedChannelId === channel.id}
      isMuted={channel.isMuted}
      onClick={() => audioEditorManager.setSelectedChannel(channel.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const trackChannel = audioEditorManager.channels.get(
          e.dataTransfer.getData('text/channelId'),
        );
        if (!trackChannel) {
          return;
        }
        const track = [...trackChannel.tracks].find(
          (track) => track.data.uuid === e.dataTransfer.getData('text/trackId'),
        );
        if (!track) {
          return;
        }

        trackChannel.removeTrack(track);
        channel.addTrack(track);

        channel.tracks.forEach((tr) => {
          if (
            track.currentStartTime > tr.currentStartTime &&
            track.currentStartTime < tr.currentEndTime
          ) {
            tr.setEndTime(track.currentStartTime);
          }

          if (
            track.currentEndTime > tr.currentStartTime &&
            track.currentEndTime < tr.currentEndTime
          ) {
            tr.setStartTime(track.currentEndTime);
          }
        });
      }}
    >
      <AudioEditorTrackLine
        channel={channel}
        tracksData={tracksData}
        selectedTrack={audioEditorManager.selectedTrack}
        onTrackSelect={(track) => {
          audioEditorManager.setSelectedTrack(track);
        }}
      />
    </ChannelListItemMemoized>
  ));
});
