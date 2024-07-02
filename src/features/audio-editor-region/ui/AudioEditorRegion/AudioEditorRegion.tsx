import { observer } from 'mobx-react-lite';
import { useCallback, useRef } from 'react';

import { cn, preventAll } from '@/shared/lib';

import {
  RegionMarker,
  usePlayer,
  useTimelineController,
} from '@/entities/audio-editor';

import { useAudioEditorRegion } from '../../lib';

import { AudioEditorRegionProps } from './interfaces';

export const AudioEditorRegion = observer(function AudioEditorRegion({
  className,
  ...props
}: AudioEditorRegionProps) {
  const player = usePlayer();
  const timelineController = useTimelineController();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  3;

  const { onMouseDown } = useAudioEditorRegion(player, timelineController);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);
      player.toggleRegionLoop();
    },
    [player],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(className)}
      onMouseDown={onMouseDown}
      {...props}
    >
      <RegionMarker
        ref={regionRef}
        className='absolute left-0 top-0 h-full max-h-3'
        style={{
          left:
            timelineController.timeToVirtualPixels(player.region.start) -
            timelineController.realToVirtualPixels(timelineController.scroll) +
            timelineController.timelineLeftPadding,
          width: timelineController.timeToVirtualPixels(player.region.duration),
        }}
        isActive={player.isRegionLoopEnabled}
        onClick={handleClick}
      />
    </div>
  );
});
