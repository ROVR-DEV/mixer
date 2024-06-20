'use client';

import { useCallback, useState } from 'react';

import { preventAll } from './preventAll';
import { useWindowEvent } from './useWindowEvent';

export interface UseGlobalDnDProps {
  onDragStart?: (e: React.MouseEvent<HTMLElement> | MouseEvent) => void;
  onDrag?: (e: MouseEvent) => void;
  onDragEnd?: (e: MouseEvent) => void;
}

export const useGlobalDnD = ({
  onDragStart,
  onDrag,
  onDragEnd,
}: UseGlobalDnDProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
      preventAll(e);
      setIsDragging(true);
      onDragStart?.(e);
    },
    [onDragStart],
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      preventAll(e);
      onDrag?.(e);
    },
    [isDragging, onDrag],
  );

  const handleDragEnd = useCallback(
    (e: MouseEvent) => {
      preventAll(e);
      setIsDragging(false);
      onDragEnd?.(e);
    },
    [onDragEnd],
  );

  useWindowEvent('mousemove', handleDrag);
  useWindowEvent('mouseup', handleDragEnd);

  return {
    isDragging,
    onMouseDown: handleDragStart,
  };
};
