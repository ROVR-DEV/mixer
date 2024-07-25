import { RefObject, useCallback } from 'react';

import { Rect, useRectangularSelection } from '@/shared/lib';

import {
  AudioEditor,
  MIN_ZOOM_WIDTH_IN_PIXELS,
  Timeline,
} from '@/entities/audio-editor';

import { selectTracksInSelection } from './selectTracksInSelection';

export const useAudioEditorSelection = (
  audioEditor: AudioEditor,
  timeline: Timeline,
  selectionRef: RefObject<HTMLDivElement>,
) => {
  const handleSelectionChange = useCallback(
    (rect: Rect, e?: MouseEvent) => {
      if (audioEditor.tool === 'cursor') {
        selectTracksInSelection(
          audioEditor,
          timeline,
          rect,
          e?.shiftKey ?? true,
        );
      }
    },
    [audioEditor, timeline],
  );

  const handleSelectionEnd = useCallback(
    (rect: Rect) => {
      if (audioEditor.tool === 'magnifier') {
        const virtualRect = new Rect(
          timeline.timeToVirtualPixels(
            timeline.virtualPixelsToTime(
              rect.x +
                timeline.boundingClientRect.x +
                timeline.timelineLeftPadding,
            ),
          ),
          rect.y,
          rect.width,
          rect.height,
        );

        if (rect.width < MIN_ZOOM_WIDTH_IN_PIXELS) {
          return;
        }

        audioEditor.magnify(virtualRect);
      }
    },
    [audioEditor, timeline],
  );

  return useRectangularSelection({
    ref: selectionRef,
    timeline,
    onChange: handleSelectionChange,
    onEnd: handleSelectionEnd,
  });
};
