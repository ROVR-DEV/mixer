import { observer } from 'mobx-react-lite';
import { useCallback, useRef } from 'react';

import { clamp, cn, preventAll, useGlobalDnD } from '@/shared/lib';
import { DnDData } from '@/shared/model';

import {
  RegionMarker,
  usePlayer,
  useTimelineController,
} from '@/entities/audio-editor';

import { useAudioEditorRegion } from '../../lib';
import { AudioEditorRegionTrimMarker } from '../AudioEditorRegionTrimMarker';

import { AudioEditorRegionProps } from './interfaces';

type AudioEditorRegionDnDData = DnDData<{ startTime: number }>;

const draggingCursor = 'grabbing';

export const AudioEditorRegion = observer(function AudioEditorRegion({
  ...props
}: AudioEditorRegionProps) {
  const player = usePlayer();
  const timeline = useTimelineController();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);

  const { onMouseDown } = useAudioEditorRegion(player, timeline);

  const handleDragStartMarker = useCallback(
    (
      _: MouseEvent | React.MouseEvent<HTMLElement>,
      dndData: AudioEditorRegionDnDData,
    ) => {
      if (markerRef.current) {
        markerRef.current.style.cursor = draggingCursor;
      }
      dndData.customProperties.startTime = player.region.start;
    },
    [player.region.start],
  );

  const handleDragMarker = useCallback(
    (_: MouseEvent, dndData: AudioEditorRegionDnDData) => {
      if (dndData.customProperties.startTime === undefined) {
        return;
      }

      const timeOffset =
        timeline.pixelsToTime(dndData.currentPosition.x) -
        timeline.pixelsToTime(dndData.startPosition.x);

      const newTime = clamp(dndData.customProperties.startTime + timeOffset, 0);

      player.region.end = newTime + player.region.duration;
      player.region.start = newTime;
    },
    [player.region, timeline],
  );

  const handleDragEndMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.style.cursor = '';
    }
  }, []);

  const {
    isDragging,
    onMouseDown: markerOnMouseDown,
    onMouseUp: markerOnMouseUp,
  } = useGlobalDnD({
    cursor: 'grabbing',
    onDragStart: handleDragStartMarker,
    onDrag: handleDragMarker,
    onDragEnd: handleDragEndMarker,
  });

  const handleOnMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      markerOnMouseUp(e);

      if (!isDragging) {
        player.region.toggle();
      }
    },
    [isDragging, markerOnMouseUp, player.region],
  );

  return (
    <div
      ref={wrapperRef}
      onMouseDown={onMouseDown}
      onClick={preventAll}
      {...props}
    >
      <div
        ref={regionRef}
        className={cn('absolute left-0 top-0 h-full max-h-3', {
          hidden: player.region.duration === 0,
        })}
        style={{
          left:
            timeline.timeToVirtualPixels(player.region.start) -
            timeline.realToVirtualPixels(timeline.scroll) +
            timeline.timelineLeftPadding,
          width: timeline.timeToVirtualPixels(player.region.duration),
        }}
      >
        <RegionMarker
          ref={markerRef}
          className='h-full cursor-grab'
          isActive={player.region.isEnabled}
          onMouseDown={markerOnMouseDown}
          onMouseUp={handleOnMouseUp}
        />
        <AudioEditorRegionTrimMarker
          className='absolute -left-1 top-0 h-full w-2'
          trimSide='left'
        />
        <AudioEditorRegionTrimMarker
          className='absolute -right-1 top-0 h-full w-2'
          trimSide='right'
        />
      </div>
    </div>
  );
});
