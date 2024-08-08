'use client';

import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { preventAll } from '@/shared/lib';
import { CustomDraggable } from '@/shared/ui';

// eslint-disable-next-line boundaries/element-types
import { useTimeline } from '@/entities/audio-editor';

import { useFadeMarkerDnD } from '../../lib';
import { FadeMarkerMemoized } from '../FadeMarker';

import { FadeMarkerDragHandlerProps } from './interfaces';

export const DraggableFadeMarker = observer(function FadeMarkerDragHandler({
  track,
  side,
  ...props
}: FadeMarkerDragHandlerProps) {
  const timeline = useTimeline();

  const markerRef = useRef<HTMLDivElement | null>(null);

  const fadeMarkerDragProps = useFadeMarkerDnD({ side, track, timeline });

  return (
    <CustomDraggable
      cancel=''
      handle=''
      nodeRef={markerRef}
      onMouseDown={preventAll}
      {...fadeMarkerDragProps}
    >
      <FadeMarkerMemoized
        ref={markerRef}
        className='absolute z-10'
        side={side}
        {...props}
      />
    </CustomDraggable>
  );
});
