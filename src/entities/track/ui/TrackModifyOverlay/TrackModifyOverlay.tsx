'use client';

import { observer } from 'mobx-react-lite';

import { cn, useContainer } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditor } from '@/entities/audio-editor';
import { TrackTrimMarker } from '@/entities/track';

import { FadeOverlay } from '../FadeOverlay';

import { TrackModifyOverlayProps } from './interfaces';

export const TrackModifyOverlay = observer(function TrackModifyOverlay({
  track,
  ignoreSelection,
  trackRef,
  fadePosition,
}: TrackModifyOverlayProps) {
  const audioEditor = useAudioEditor();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const min32 = trackRef ? useContainer(trackRef, 32) : true;

  const isSelectedInEditor =
    !ignoreSelection && audioEditor.isTrackSelected(track);

  return (
    <>
      <div className='absolute top-0 z-10 flex size-full'>
        <FadeOverlay
          className='h-full'
          side='left'
          track={track}
          position={fadePosition.left}
          isTrackSelected={isSelectedInEditor}
        />
        <div className='grow' />
        <FadeOverlay
          className='h-full'
          side='right'
          track={track}
          position={fadePosition.right}
          isTrackSelected={isSelectedInEditor}
        />
      </div>
      <TrackTrimMarker
        className={cn('absolute bottom-0 left-0 z-20 w-1/2', {
          'w-4': min32,
        })}
        side='left'
        track={track}
      />
      <TrackTrimMarker
        className={cn('absolute bottom-0 right-0 z-20 w-1/2', {
          'w-4': min32,
        })}
        side='right'
        track={track}
      />
    </>
  );
});
