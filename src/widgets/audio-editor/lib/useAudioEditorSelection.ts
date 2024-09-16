import { RefObject, useCallback } from 'react';

import { useRectangularSelection } from '@/shared/lib';
import { Rect } from '@/shared/model';

import {
  AudioEditor,
  MIN_ZOOM_WIDTH_IN_PIXELS,
  Timeline,
} from '@/entities/audio-editor';

import { selectTracksInSelection } from './selectTracksInSelection';

const MIN_SELECTION_RECT = new Rect(
  0,
  0,
  MIN_ZOOM_WIDTH_IN_PIXELS,
  MIN_ZOOM_WIDTH_IN_PIXELS,
);

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
          rect.x + timeline.hScroll,
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
    minSelectionRect: MIN_SELECTION_RECT,
    onChange: handleSelectionChange,
    onEnd: handleSelectionEnd,
  });
};
