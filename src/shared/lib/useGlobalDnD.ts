'use client';

import { useCallback, useRef, useState } from 'react';

import { preventAll } from './preventAll';
import { useWindowEvent } from './useWindowEvent';

export interface UseGlobalDnDProps {
  onDragStart?: (e: MouseEvent | React.MouseEvent<HTMLElement>) => void;
  onDrag?: (e: MouseEvent) => void;
  onDragEnd?: (e: MouseEvent | React.MouseEvent<HTMLElement>) => void;
}

export const useGlobalDnD = ({
  onDragStart,
  onDrag,
  onDragEnd,
}: UseGlobalDnDProps) => {
  const isPressedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      isPressedRef.current = true;
      preventAll(e);
    },
    [],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPressedRef.current && !isDraggingRef.current) {
        onDragStart?.(e);

        setIsDragging(true);
        isDraggingRef.current = true;
      }

      if (!isDraggingRef.current) {
        return;
      }

      preventAll(e);

      onDrag?.(e);
    },
    [onDrag, onDragStart],
  );

  const onMouseUp = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      isPressedRef.current = false;

      if (!isDraggingRef.current) {
        return;
      }

      preventAll(e);

      onDragEnd?.(e);

      setIsDragging(false);
      isDraggingRef.current = false;
    },
    [onDragEnd],
  );

  useWindowEvent('mousemove', onMouseMove);
  useWindowEvent('mouseup', onMouseUp);

  return {
    isDragging,
    onMouseUp: onMouseUp,
    onMouseDown: onMouseDown,
  };
};
