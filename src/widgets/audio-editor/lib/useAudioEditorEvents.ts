import { RefObject, useCallback } from 'react';

// eslint-disable-next-line boundaries/element-types
import {
  useGlobalMouseMove,
  useIsMouseClickStartsOnThisSpecificElement,
} from '@/shared/lib';

import {
  AudioEditor,
  Timeline,
  useHandleTimeSeek,
} from '@/entities/audio-editor';

import { useAudioEditorSelection } from './useAudioEditorSelection';

export const useAudioEditorEvents = (
  audioEditor: AudioEditor,
  timeline: Timeline,
  rulerWrapperRef: RefObject<HTMLDivElement>,
  rectangularSelectionRef: RefObject<HTMLDivElement>,
): { isSelecting: boolean } & Pick<
  React.ComponentProps<'div'>,
  'onMouseDown' | 'onMouseUp'
> => {
  const { isSelecting, onMouseDown: onMouseDownSelection } =
    useAudioEditorSelection(audioEditor, timeline, rectangularSelectionRef);

  const handleTimeSeek = useHandleTimeSeek(audioEditor.player, timeline);

  const { onClick: onElementClick, onMouseDown: onElementMouseDown } =
    useIsMouseClickStartsOnThisSpecificElement();

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onElementMouseDown?.(e);
      if (audioEditor.tool === 'cursor' || audioEditor.tool === 'magnifier') {
        onMouseDownSelection?.(e);
      }
    },
    [audioEditor.tool, onElementMouseDown, onMouseDownSelection],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isSelecting) {
        return;
      }

      if (!onElementClick?.(e)) {
        return;
      }

      if (isSelecting) {
        return;
      }

      if (audioEditor.tool === 'cursor') {
        handleTimeSeek(e);
        audioEditor.unselectTracks();
      } else if (audioEditor.tool === 'magnifier') {
        audioEditor.unMagnify();
      }
    },
    [audioEditor, handleTimeSeek, isSelecting, onElementClick],
  );

  useGlobalMouseMove(handleTimeSeek, rulerWrapperRef);

  return { isSelecting, onMouseUp: onMouseUp, onMouseDown: onMouseDown };
};
