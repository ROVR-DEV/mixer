'use client';

import { observer } from 'mobx-react-lite';

// eslint-disable-next-line boundaries/element-types
import { usePlayer } from '@/entities/audio-editor';

import { FadeOverlay } from '../FadeOverlay';
import { TrackTrimMarker } from '../TrackTrimMarker';

import { TrackModifyOverlayProps } from './interfaces';

export const TrackModifyOverlay = observer(function TrackModifyOverlay({
  track,
  ignoreSelection,
}: TrackModifyOverlayProps) {
  const player = usePlayer();

  const isSelectedInEditor = !ignoreSelection && player.isTrackSelected(track);

  return (
    <>
      <FadeOverlay
        className='absolute top-0 z-10'
        side='left'
        track={track}
        isTrackSelected={isSelectedInEditor}
      />
      <FadeOverlay
        className='absolute top-0 z-10'
        side='right'
        track={track}
        isTrackSelected={isSelectedInEditor}
      />
      <TrackTrimMarker
        className='absolute bottom-0 left-0 z-20'
        trimSide='left'
        track={track}
      />
      <TrackTrimMarker
        className='absolute bottom-0 right-0 z-20'
        trimSide='right'
        track={track}
      />
    </>
  );
});
