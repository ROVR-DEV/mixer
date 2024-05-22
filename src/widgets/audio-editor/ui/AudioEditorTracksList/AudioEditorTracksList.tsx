'use client';

import { observer } from 'mobx-react-lite';
import { ReactNode, useMemo } from 'react';

import { ChannelListItemMemoized } from '@/entities/channel';

import { TrackCardViewMemoized } from '@/features/track-card-view';

import { AudioEditorTracksListProps } from './interfaces';

export const AudioEditorTracksList = observer(function AudioEditorTracksList({
  audioEditorManager,
  tracksData,
}: AudioEditorTracksListProps) {
  const trackCards = useMemo(() => {
    const components = new Map<string, ReactNode>();

    audioEditorManager.channels.forEach((channel) =>
      channel.tracks.forEach((track) => {
        components.set(
          track.data.uuid,
          <TrackCardViewMemoized
            key={`${track.data.uuid}-track`}
            track={track}
            trackData={tracksData[track.data.uuid]}
            audioEditorManager={audioEditorManager}
          />,
        );
      }),
    );

    return components;
  }, [audioEditorManager, tracksData]);

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
      {[...channel.tracks.values()].map((track) =>
        trackCards.get(track.data.uuid),
      )}
    </ChannelListItemMemoized>
  ));
});
