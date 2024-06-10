'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useRef } from 'react';

import { clamp, cn, removeDragGhostImage } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { FadePointProps } from './interfaces';

export const FadePoint = observer(function FadePoint({
  audioEditorManager,
  side,
  className,
  ...props
}: FadePointProps) {
  const timelineController = useTimelineController();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!audioEditorManager?.editableTrack?.trackAudioFilters) {
        return;
      }

      const newX = timelineController.realLocalPixelsToGlobal(
        timelineController.virtualToRealPixels(
          e.pageX - timelineController.startPageX,
        ),
      );

      const time = clamp(
        newX,
        audioEditorManager.editableTrack.currentStartTime,
        audioEditorManager.editableTrack.currentEndTime,
      );

      if (side === 'left') {
        audioEditorManager.editableTrack.trackAudioFilters.fadeInNode.linearFadeOut(
          0,
          time,
        );
      } else if (side === 'right') {
        audioEditorManager.editableTrack.trackAudioFilters.fadeOutNode.linearFadeOut(
          time,
          audioEditorManager.editableTrack.duration - time,
        );
      }
    },
    [audioEditorManager.editableTrack, side, timelineController],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (
        audioEditorManager.editableTrack?.trackAudioFilters &&
        audioEditorManager.editableTrack?.trackAudioFilters.audioContext
          .state === 'suspended'
      ) {
        audioEditorManager.editableTrack?.trackAudioFilters.audioContext.resume();
      }

      removeDragGhostImage(e);
      handleDrag(e);
    },
    [audioEditorManager.editableTrack?.trackAudioFilters, handleDrag],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      handleDrag(e);
    },
    [handleDrag],
  );

  const onDragDropPrevent = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    },
    [],
  );

  const x = useMemo(() => {
    if (side === 'left') {
      return (
        timelineController.realToVirtualPixels(
          timelineController.realGlobalPixelsToLocal(
            audioEditorManager.editableTrack?.trackAudioFilters?.fadeInNode
              .fadeFilter.endTime ?? 0,
          ),
        ) + timelineController.timelineLeftPadding
      );
    } else {
      return (
        timelineController.realToVirtualPixels(
          audioEditorManager.editableTrack?.trackAudioFilters?.fadeOutNode
            .fadeFilter.startTime ??
            audioEditorManager.editableTrack?.duration ??
            0,
        ) +
        timelineController.timelineLeftPadding -
        1
      );
    }
  }, [
    audioEditorManager.editableTrack?.duration,
    audioEditorManager.editableTrack?.trackAudioFilters?.fadeInNode.fadeFilter
      .endTime,
    audioEditorManager.editableTrack?.trackAudioFilters?.fadeOutNode.fadeFilter
      .startTime,
    side,
    timelineController,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn('relative flex h-full flex-col items-center', className)}
      style={{
        width: side === 'left' ? x : `calc(100% - ${x}px)`,
        left: side === 'left' ? '' : x,
      }}
      {...props}
    >
      <div
        className='absolute top-[-5px] z-10 flex h-[calc(100%+5px)] w-[11px] flex-col items-center '
        style={{
          left: side === 'right' ? -5 : '',
          right: side === 'left' ? -5 : '',
        }}
        draggable
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={onDragDropPrevent}
        onDrop={onDragDropPrevent}
      >
        <div className='pointer-events-none aspect-square size-[11px] min-h-[11px] min-w-[11px] rounded-full border border-primary bg-accent' />
        <div className='pointer-events-none h-full w-px bg-accent' />
      </div>
      {side === 'left' && (
        <div
          className='absolute size-full bg-third-light/40'
          style={{
            clipPath: 'polygon(0% 100%, 100% 0%, 100% 100%)',
          }}
        />
      )}
      {side === 'right' && (
        <div
          className='absolute size-full bg-third-light/40'
          style={{
            clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)',
          }}
        />
      )}
    </div>
  );
});
