import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';
import { CustomDragEventHandler } from '@/shared/model';
import { CustomDraggable } from '@/shared/ui';

import { RegionMarker, usePlayer, useTimeline } from '@/entities/audio-editor';

import { useAudioEditorRegionDnD } from '../../lib';
import { RegionTrimMarker } from '../RegionTrimMarker';

import { AudioEditorRegionProps } from './interfaces';

export const AudioEditorRegion = observer(function AudioEditorRegion({
  ...props
}: AudioEditorRegionProps) {
  const player = usePlayer();
  const timeline = useTimeline();

  const regionRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);

  const { isDragging, onStop, ...draggableProps } = useAudioEditorRegionDnD(
    player,
    timeline,
  );

  const handleOnMouseUp: CustomDragEventHandler = useCallback(
    (...args) => {
      if (!isDragging) {
        player.region.toggle();
      }
      onStop?.(...args);
    },
    [isDragging, onStop, player.region],
  );

  const { isHidden, width } = useMemo(
    () => ({
      isHidden: player.region.duration === 0,
      width: timeline.timeToVirtualPixels(player.region.duration),
    }),
    [player.region.duration, timeline],
  );

  const position = useMemo(
    () =>
      timeline.timeToVirtualPixels(player.region.start) -
      timeline.realToVirtualPixels(timeline.scroll) +
      timeline.timelineLeftPadding,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      timeline,
      timeline.scroll,
      timeline.timelineLeftPadding,
      player,
      player.region.start,
    ],
  );

  return (
    <div
      ref={regionRef}
      className={cn('absolute left-0 top-0 h-full max-h-3', {
        hidden: isHidden,
      })}
      style={{
        left: position,
        width: width,
      }}
      {...props}
    >
      <CustomDraggable
        cancel=''
        handle=''
        nodeRef={markerRef}
        onMouseDown={preventAll}
        onStop={handleOnMouseUp}
        {...draggableProps}
      >
        <RegionMarker
          ref={markerRef}
          className='h-full cursor-grab'
          isActive={player.region.isEnabled}
        />
      </CustomDraggable>
      <RegionTrimMarker
        className='absolute -left-1 top-0 h-full w-2'
        trimSide='left'
      />
      <RegionTrimMarker
        className='absolute -right-1 top-0 h-full w-2'
        trimSide='right'
      />
    </div>
  );
});
