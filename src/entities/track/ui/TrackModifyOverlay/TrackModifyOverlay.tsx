'use client';

import { observer } from 'mobx-react-lite';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditor } from '@/entities/audio-editor';

import { FadeOverlay } from '../FadeOverlay';
import { TrackTrimMarker } from '../TrackTrimMarker';

import { TrackModifyOverlayProps } from './interfaces';

export const TrackModifyOverlay = observer(function TrackModifyOverlay({
  track,
  ignoreSelection,
}: TrackModifyOverlayProps) {
  const audioEditor = useAudioEditor();

  const isSelectedInEditor =
    !ignoreSelection && audioEditor.isTrackSelected(track);

  return (
    <>
      <div className='absolute top-0 z-10 flex size-full'>
        <FadeOverlay
          className='h-full'
          side='left'
          track={track}
          isTrackSelected={isSelectedInEditor}
        />
        <div className='grow' />
        <FadeOverlay
          className='h-full'
          side='right'
          track={track}
          isTrackSelected={isSelectedInEditor}
        />
      </div>
      <TrackTrimMarker
        className='absolute bottom-0 left-0 z-20 w-1/2 @[32px]:w-4'
        trimSide='left'
        track={track}
      />
      <TrackTrimMarker
        className='absolute bottom-0 right-0 z-20 w-1/2 @[32px]:w-4'
        trimSide='right'
        track={track}
      />
    </>
  );
});
