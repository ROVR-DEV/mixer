import { RefObject, useCallback } from 'react';

import { clamp, preventAll, useGlobalDnD } from '@/shared/lib';
import { DnDData, Point } from '@/shared/model';

import { SIDEBAR_WIDTH } from '@/entities/audio-editor';

export type FloatingToolbarDnDData = DnDData<{ startPoint: Point }>;

const draggingCursor = 'move';

export const useFloatingToolbarDnD = (
  ref: RefObject<HTMLElement>,
  containerRef: RefObject<HTMLElement>,
) => {
  const handleDrag = useCallback(
    (_: unknown, dndData: FloatingToolbarDnDData) => {
      if (!ref.current) {
        return;
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) {
        return;
      }

      const selfRect = ref.current.getBoundingClientRect();
      if (!selfRect) {
        return;
      }

      const offsetX =
        dndData.currentPosition.x -
        dndData.offsetFromContainer.x -
        dndData.startPosition.x;
      const offsetY =
        dndData.currentPosition.y -
        dndData.offsetFromContainer.y -
        dndData.startPosition.y;

      const x = clamp(
        dndData.startPosition.x + offsetX - containerRect.x,
        SIDEBAR_WIDTH,
        containerRect.width - ref.current.clientWidth,
      );

      const y = clamp(
        dndData.startPosition.y + offsetY - containerRect.y,
        0,
        containerRect.height - ref.current.clientHeight,
      );

      ref.current.style.left = `${x}px`;
      ref.current.style.top = `${y}px`;
    },
    [containerRef, ref],
  );

  const { isDragging, onMouseDown, onMouseUp } = useGlobalDnD({
    container: ref,
    cursor: draggingCursor,
    onDrag: handleDrag,
  });

  const handleToolbarMoveHandleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      preventAll(e);

      if (!isDragging && e.detail === 2 && ref.current) {
        ref.current.style.left = '';
        ref.current.style.top = '';
      }

      onMouseUp(e);
    },
    [isDragging, onMouseUp, ref],
  );

  return {
    isDragging,
    onMouseDown: onMouseDown,
    onMouseUp: handleToolbarMoveHandleMouseUp,
  };
};
