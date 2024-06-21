'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line boundaries/element-types
import { TimelineController } from '@/entities/audio-editor';

import { clamp } from './clamp';
import { preventAll } from './preventAll';
import { useWindowEvent } from './useWindowEvent';

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  get left(): number {
    return this.x;
  }

  get right(): number {
    return this.x + this.width;
  }

  constructor(x?: number, y?: number, width?: number, height?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.width = width ?? 0;
    this.height = height ?? 0;
  }
}

export interface UseRectangularSelectionProps {
  ref: RefObject<HTMLDivElement>;
  timelineController: TimelineController;
  onChange?: (rect: Rect) => void;
}

export const useRectangularSelection = ({
  ref,
  timelineController,
  onChange,
}: UseRectangularSelectionProps): React.ComponentProps<'div'> & {
  isSelecting: boolean;
} => {
  const [isSelecting, setIsSelecting] = useState(false);

  const startPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateSelection = useCallback(
    (x: number, y: number) => {
      if (!isSelecting) {
        return;
      }

      const startX =
        startPositionRef.current.x - timelineController.boundingClientRect.x;

      const startY =
        startPositionRef.current.y - timelineController.boundingClientRect.y;

      const mouseX = clamp(x - timelineController.boundingClientRect.x, 0);
      const mouseY = clamp(y - timelineController.boundingClientRect.y, 0);

      const selectionRect = new Rect(
        Math.min(startX, mouseX),
        Math.min(startY, mouseY),
        Math.abs(startX - mouseX),
        Math.abs(startY - mouseY),
      );

      requestAnimationFrame(() => {
        if (!ref.current) {
          return;
        }

        ref.current.style.left = `${selectionRect.x}px`;
        ref.current.style.top = `${selectionRect.y}px`;
        ref.current.style.width = `${selectionRect.width}px`;
        ref.current.style.height = `${selectionRect.height}px`;

        onChange?.(selectionRect);
      });
    },
    [
      isSelecting,
      onChange,
      ref,
      timelineController.boundingClientRect.x,
      timelineController.boundingClientRect.y,
    ],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) {
        return;
      }

      if (
        e.target !== timelineController.timelineContainer.timelineRef.current
      ) {
        return;
      }
      preventAll(e);

      setIsSelecting(true);

      startPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      if (!isSelecting) {
        return;
      }
      preventAll(e);

      if (ref.current.style.display === 'none') {
        ref.current.style.display = '';
      }

      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      updateSelection(mousePositionRef.current.x, mousePositionRef.current.y);
    },
    [isSelecting, ref, updateSelection],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }
      if (!isSelecting) {
        return;
      }

      preventAll(e);

      setIsSelecting(false);

      ref.current.style.display = 'none';
    },
    [isSelecting, ref],
  );

  useEffect(() => {
    const updateContainerRect = () => {
      updateSelection(mousePositionRef.current.x, mousePositionRef.current.y);
    };

    updateContainerRect();

    timelineController.scrollController.addListener(updateContainerRect);
    timelineController.zoomController.addListener(updateContainerRect);

    return () => {
      timelineController.zoomController.removeListener(updateContainerRect);
      timelineController.scrollController.removeListener(updateContainerRect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timelineController.scrollController,
    timelineController.timelineClientHeight,
    timelineController.timelineScrollWidth,
    timelineController.zoomController,
  ]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.style.display = 'none';
  }, [ref]);

  useWindowEvent('mousemove', handleMouseMove);
  useWindowEvent('mouseup', handleMouseUp);

  return { isSelecting, onMouseDown: handleMouseDown };
};
