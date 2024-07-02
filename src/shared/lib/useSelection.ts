'use client';

import { useCallback, useRef, useState } from 'react';

import { preventAll } from './preventAll';

import { Rect, clamp, useWindowEvent } from '.';

type Point = { x: number; y: number };

export interface UseSelectionProps {
  offsetRect?: Rect;
  boundsRect?: Rect;
  onChange?: (rect: Rect, e: MouseEvent) => void;
}

export const useSelection = ({
  offsetRect = new Rect(0, 0, 0, 0),
  boundsRect = new Rect(-Infinity, -Infinity, Infinity, Infinity),
  onChange,
}: UseSelectionProps) => {
  const isPressedRef = useRef(false);
  const startPositionRef = useRef<Point>({ x: 0, y: 0 });

  const [isSelecting, setIsSelecting] = useState(false);

  const updateSelection = useCallback(
    (e: MouseEvent) => {
      const startX = startPositionRef.current.x;
      const startY = startPositionRef.current.y;

      const mouseX = clamp(
        e.pageX + offsetRect.left,
        boundsRect.left,
        boundsRect.right,
      );
      const mouseY = clamp(
        e.pageY + offsetRect.top,
        boundsRect.top,
        boundsRect.bottom,
      );

      const selectionRect = new Rect(
        Math.min(startX, mouseX),
        Math.min(startY, mouseY),
        Math.abs(startX - mouseX),
        Math.abs(startY - mouseY),
      );

      onChange?.(selectionRect, e);
    },
    [
      boundsRect.bottom,
      boundsRect.left,
      boundsRect.right,
      boundsRect.top,
      offsetRect.left,
      offsetRect.top,
      onChange,
    ],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      preventAll(e);

      isPressedRef.current = true;

      startPositionRef.current = {
        x: e.pageX + offsetRect.left,
        y: e.pageY + offsetRect.top,
      };
    },
    [offsetRect.left, offsetRect.top],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPressedRef.current && !isSelecting) {
        setIsSelecting(true);
      }

      if (!isSelecting) {
        return;
      }

      updateSelection(e);
    },
    [isSelecting, updateSelection],
  );

  const handleMouseUp = useCallback(() => {
    isPressedRef.current = false;

    if (!isSelecting) {
      return;
    }

    setIsSelecting(false);
  }, [isSelecting]);

  useWindowEvent('mousemove', handleMouseMove);
  useWindowEvent('mouseup', handleMouseUp);

  return { isSelecting, onMouseDown: handleMouseDown };
};
