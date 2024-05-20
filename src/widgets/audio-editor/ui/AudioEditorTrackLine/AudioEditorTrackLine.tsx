'use client';

import { observer } from 'mobx-react-lite';

import { TrackCardView } from '@/features/track-card-view';

import { AudioEditorTrackProps } from './interfaces';

export const AudioEditorTrackLine = observer(function AudioEditorTrackLine({
  channel,
  selectedTrack,
  onTrackSelect,
  tracksData,
}: AudioEditorTrackProps) {
  return [...channel.tracks.values()].map((track) => {
    return !track ? null : (
      <TrackCardView
        key={`${track.data.uuid}-track`}
        channel={channel}
        track={track}
        isSelected={selectedTrack?.data.uuid === track.data.uuid}
        onTrackSelect={onTrackSelect}
        trackData={tracksData[track.data.uuid]}
      />
    );
  });
});
