'use client';

import { observer } from 'mobx-react-lite';

import { TrackCardView } from '@/features/track-card-view';

import { AudioEditorTracksViewProps } from './interfaces';

export const AudioEditorTracksView = observer(function AudioEditorTracksView({
  channel,
  tracksData,
  audioEditorManager,
}: AudioEditorTracksViewProps) {
  return channel.tracks.map((track) => {
    return !track ? null : (
      <TrackCardView
        key={`track-${track.uuid}`}
        track={track}
        trackData={tracksData[track.data.uuid]}
        audioEditorManager={audioEditorManager}
      />
    );
  });
});
