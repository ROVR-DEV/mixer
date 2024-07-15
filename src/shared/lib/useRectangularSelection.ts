'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line boundaries/element-types
import { Timeline } from '@/entities/audio-editor';

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

  get top(): number {
    return this.y;
  }

  get bottom(): number {
    return this.y + this.height;
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
  timeline: Timeline;
  onChange?: (rect: Rect, e?: MouseEvent) => void;
  onEnd?: (rect: Rect, e?: MouseEvent) => void;
}

export const useRectangularSelection = ({
  ref,
  timeline,
  onChange,
  onEnd,
}: UseRectangularSelectionProps): React.ComponentProps<'div'> & {
  isSelecting: boolean;
} => {
  const prevEvent = useRef<MouseEvent | null>(null);

  const isPressedRef = useRef(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const startPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const grid = timeline.timelineContainer.timelineRef.current?.parentElement;

  const getSelectionRec = useCallback((x: number, y: number) => {
    const startX = startPositionRef.current.x;
    const startY = startPositionRef.current.y;

    const mouseX = clamp(x, 0);
    const mouseY = clamp(y, 0);

    return new Rect(
      Math.min(startX, mouseX),
      Math.min(startY, mouseY),
      Math.abs(startX - mouseX),
      Math.abs(startY - mouseY),
    );
  }, []);

  const updateSelection = useCallback(
    (x: number, y: number, e?: MouseEvent) => {
      if (!isSelecting) {
        return;
      }

      const selectionRect = getSelectionRec(x, y);

      requestAnimationFrame(() => {
        if (!ref.current) {
          return;
        }

        ref.current.style.left = `${selectionRect.x}px`;
        ref.current.style.top = `${selectionRect.y}px`;
        ref.current.style.width = `${selectionRect.width}px`;
        ref.current.style.height = `${selectionRect.height}px`;
      });
      onChange?.(selectionRect, e);
    },
    [getSelectionRec, isSelecting, onChange, ref],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) {
        return;
      }

      preventAll(e);

      isPressedRef.current = true;

      startPositionRef.current = {
        x: e.pageX - timeline.boundingClientRect.x,
        y: e.pageY - timeline.boundingClientRect.y + (grid?.scrollTop ?? 0),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref, grid?.scrollTop],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      if (isPressedRef.current && !isSelecting) {
        setIsSelecting(true);
      }

      if (!isSelecting) {
        return;
      }

      preventAll(e);

      if (ref.current.style.display === 'none') {
        ref.current.style.display = '';
      }

      prevEvent.current = e;

      mousePositionRef.current = {
        x: e.pageX - timeline.boundingClientRect.x,
        y: e.pageY - timeline.boundingClientRect.y + (grid?.scrollTop ?? 0),
      };

      updateSelection(
        mousePositionRef.current.x,
        mousePositionRef.current.y,
        e,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSelecting, ref, updateSelection, grid?.scrollTop],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      isPressedRef.current = false;

      if (!isSelecting) {
        return;
      }

      preventAll(e);

      mousePositionRef.current = {
        x: e.pageX - timeline.boundingClientRect.x,
        y: e.pageY - timeline.boundingClientRect.y + (grid?.scrollTop ?? 0),
      };

      const selectionRect = getSelectionRec(
        mousePositionRef.current.x,
        mousePositionRef.current.y,
      );

      onEnd?.(selectionRect, e);

      setIsSelecting(false);

      ref.current.style.display = 'none';
    },
    [
      getSelectionRec,
      grid?.scrollTop,
      isSelecting,
      onEnd,
      ref,
      timeline.boundingClientRect.x,
      timeline.boundingClientRect.y,
    ],
  );

  useEffect(() => {
    const updateContainerRect = () => {
      updateSelection(
        mousePositionRef.current.x,
        mousePositionRef.current.y,
        prevEvent.current ?? undefined,
      );
    };

    updateContainerRect();

    timeline.scrollController.addListener(updateContainerRect);
    timeline.zoomController.addListener(updateContainerRect);

    return () => {
      timeline.zoomController.removeListener(updateContainerRect);
      timeline.scrollController.removeListener(updateContainerRect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeline.scrollController,
    timeline.timelineClientHeight,
    timeline.timelineScrollWidth,
    timeline.zoomController,
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
