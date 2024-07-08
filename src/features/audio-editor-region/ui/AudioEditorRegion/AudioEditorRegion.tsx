import { observer } from 'mobx-react-lite';
import { useCallback, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';

import {
  RegionMarker,
  usePlayer,
  useTimelineController,
} from '@/entities/audio-editor';

import { useAudioEditorRegion } from '../../lib';
import { AudioEditorRegionTrimMarker } from '../AudioEditorRegionTrimMarker';

import { AudioEditorRegionProps } from './interfaces';

export const AudioEditorRegion = observer(function AudioEditorRegion({
  ...props
}: AudioEditorRegionProps) {
  const player = usePlayer();
  const timelineController = useTimelineController();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);

  const { onMouseDown } = useAudioEditorRegion(player, timelineController);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);
      player.region.toggle();
    },
    [player],
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
            timelineController.timeToVirtualPixels(player.region.start) -
            timelineController.realToVirtualPixels(timelineController.scroll) +
            timelineController.timelineLeftPadding,
          width: timelineController.timeToVirtualPixels(player.region.duration),
        }}
      >
        <RegionMarker
          className='h-full'
          isActive={player.region.isEnabled}
          onClick={handleClick}
        />
        <AudioEditorRegionTrimMarker
          className='absolute left-0 top-0 h-full'
          trimSide='left'
        />
        <AudioEditorRegionTrimMarker
          className='absolute right-0 top-0 h-full'
          trimSide='right'
        />
      </div>
    </div>
  );
});
