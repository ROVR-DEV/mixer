'use client';

import { CSSProperties, useCallback, useRef, useState } from 'react';

import { DnDData, Point } from '../model';

import { preventAll } from './preventAll';
import { useWindowEvent } from './useWindowEvent';

export interface UseGlobalDnDProps<T extends Record<string, unknown>> {
  cursor?: CSSProperties['cursor'];
  onDragStart?: (
    e: MouseEvent | React.MouseEvent<HTMLElement>,
    dndData: DnDData<T>,
  ) => void;
  onDrag?: (e: MouseEvent, dndData: DnDData<T>) => void;
  onDragEnd?: (
    e: MouseEvent | React.MouseEvent<HTMLElement>,
    dndData: DnDData<T>,
  ) => void;
}

export const useGlobalDnD = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  cursor,
  onDragStart,
  onDrag,
  onDragEnd,
}: UseGlobalDnDProps<T>) => {
  const isPressedRef = useRef(false);
  const isDraggingRef = useRef(false);

  const startDragPointRef = useRef<Point>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);

  const dndDataRef = useRef<DnDData<T>>({
    isDragging: false,
    startTime: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    customProperties: {},
  });

  const updateDnDData = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      dndDataRef.current.isDragging = isDraggingRef.current;
      dndDataRef.current.startTime = startDragPointRef.current;
      dndDataRef.current.currentPosition = { x: e.pageX, y: e.pageY };

      return dndDataRef.current;
    },
    [],
  );

  const setDrag = useCallback((enable: boolean) => {
    isDraggingRef.current = enable;
    setIsDragging(enable);
  }, []);

  const startDrag = useCallback(
    (e: MouseEvent) => {
      setDrag(true);
      onDragStart?.(e, updateDnDData(e));
    },
    [setDrag, onDragStart, updateDnDData],
  );

  const onMouseDown = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      isPressedRef.current = true;
      preventAll(e);

      if (cursor) {
        document.body.style.cursor = cursor;
      }

      startDragPointRef.current = { x: e.pageX, y: e.pageY };
    },
    [cursor],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPressedRef.current && !isDraggingRef.current) {
        startDrag(e);
      }

      if (!isDraggingRef.current) {
        return;
      }

      onDrag?.(e, updateDnDData(e));
    },
    [onDrag, updateDnDData, startDrag],
  );

  const onMouseUp = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      isPressedRef.current = false;

      if (!isDraggingRef.current) {
        return;
      }

      preventAll(e);

      onDragEnd?.(e, updateDnDData(e));
      setDrag(false);

      if (cursor) {
        document.body.style.cursor = '';
      }
    },
    [onDragEnd, updateDnDData, setDrag, cursor],
  );

  useWindowEvent('mousemove', onMouseMove);
  useWindowEvent('mouseup', onMouseUp);

  return {
    isDragging,
    onMouseUp: onMouseUp,
    onMouseDown: onMouseDown,
  };
};
