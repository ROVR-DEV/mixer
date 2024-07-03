'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useMemo } from 'react';

import { clamp, preventAll, useGlobalDnD } from '@/shared/lib';
import { DnDData } from '@/shared/model';
import { TrimMarker } from '@/shared/ui';

import {
  Player,
  usePlayer,
  useTimelineController,
} from '@/entities/audio-editor';

import { checkAndToggleRegionLoop } from '../../lib';

import { AudioEditorRegionTrimMarkerProps } from './interfaces';

type AudioAudioEditorRegionTrimMarkerDnDData = DnDData<{ startTime: number }>;

const updateRegionStart = (newTime: number, player: Player) =>
  (player.region.start = clamp(newTime, 0, player.region.end));

const updateRegionEnd = (newTime: number, player: Player) =>
  (player.region.end = clamp(newTime, player.region.start));

export const AudioEditorRegionTrimMarker = observer(
  function AudioEditorRegionTrimMarker({
    ...props
  }: AudioEditorRegionTrimMarkerProps) {
    const player = usePlayer();
    const timelineController = useTimelineController();

    const updateRegion = useMemo(() => {
      switch (props.trimSide) {
        case 'left':
          return (newTime: number) => updateRegionStart(newTime, player);
        case 'right':
          return (newTime: number) => updateRegionEnd(newTime, player);
      }
    }, [player, props.trimSide]);

    const onDragStart = useCallback(
      (
        _: MouseEvent | React.MouseEvent<HTMLElement>,
        dndData: AudioAudioEditorRegionTrimMarkerDnDData,
      ) => {
        dndData.customProperties = {
          startTime:
            props.trimSide === 'left' ? player.region.start : player.region.end,
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [props.trimSide],
    );

    const onDrag = useCallback(
      (
        _: MouseEvent | React.MouseEvent<HTMLElement>,
        dndData: AudioAudioEditorRegionTrimMarkerDnDData,
      ) => {
        const timeOffset =
          timelineController.pixelsToTime(dndData.currentPosition.x) -
          timelineController.pixelsToTime(dndData.startPosition.x);

        const newTime = dndData.customProperties.startTime + timeOffset;

        updateRegion(newTime);
        checkAndToggleRegionLoop(player);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [props.trimSide, timelineController],
    );

    const { onMouseUp, onMouseDown } = useGlobalDnD({ onDragStart, onDrag });

    return (
      <TrimMarker
        onClick={preventAll}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        {...props}
      />
    );
  },
);
