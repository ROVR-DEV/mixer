'use client';

import { observer } from 'mobx-react-lite';

import { TrackCardView } from '@/features/track-card-view';

import { AudioEditorTrackProps } from './interfaces';

export const AudioEditorTrackLine = observer(function AudioEditorTrackLine({
  channel,
  tracksData,
  audioEditorManager,
}: AudioEditorTrackProps) {
  return [...channel.tracks.values()].map((track) => {
    return !track ? null : (
      <TrackCardView
        key={`${track.data.uuid}-track`}
        track={track}
        trackData={tracksData[track.data.uuid]}
        audioEditorManager={audioEditorManager}
      />
    );
  });
});
