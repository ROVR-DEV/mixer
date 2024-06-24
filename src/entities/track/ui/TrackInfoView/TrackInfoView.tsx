'use client';

import { observer } from 'mobx-react-lite';

// eslint-disable-next-line boundaries/element-types
import { usePlayer } from '@/entities/audio-editor';

import { TrackInfo } from '..';

import { TrackInfoViewProps } from './interfaces';

export const TrackInfoView = observer(function TrackInfoView({
  ...props
}: TrackInfoViewProps) {
  const player = usePlayer();

  return (
    <TrackInfo track={player.firstSelectedTrack?.meta ?? null} {...props} />
  );
});
