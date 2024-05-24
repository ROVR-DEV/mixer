'use client';

import { observer } from 'mobx-react-lite';

import { TrackInfo } from '..';

import { TrackInfoViewProps } from './interfaces';

export const TrackInfoView = observer(function TrackInfoView({
  audioEditorManager,
  ...props
}: TrackInfoViewProps) {
  return (
    <TrackInfo
      track={audioEditorManager.selectedTrack?.data ?? null}
      {...props}
    />
  );
});
