'use client';

import { useCallback, useRef } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';

import { CustomDraggableProps } from './interfaces';

export const CustomDraggable = <
  CustomData extends Record<string, unknown> = Record<string, unknown>,
>({
  allowAnyClick = false,
  disabled = false,
  enableUserSelectHack = false,
  offsetParent = typeof window === 'undefined' ? undefined : document.body,
  scale = 1,
  onDrag,
  onStart,
  onStop,
  ...props
}: CustomDraggableProps) => {
  const customDataRef = useRef<CustomData>({} as CustomData);

  const customOnStart: DraggableEventHandler = useCallback(
    (e, data) => onStart?.(e, data, customDataRef.current),
    [onStart],
  );

  const customOnDrag: DraggableEventHandler = useCallback(
    (e, data) => onDrag?.(e, data, customDataRef.current),
    [onDrag],
  );

  const customOnStop: DraggableEventHandler = useCallback(
    (e, data) => onStop?.(e, data, customDataRef.current),
    [onStop],
  );

  return (
    <DraggableCore
      allowAnyClick={allowAnyClick}
      disabled={disabled}
      enableUserSelectHack={enableUserSelectHack}
      offsetParent={offsetParent}
      scale={scale}
      onStart={customOnStart}
      onDrag={customOnDrag}
      onStop={customOnStop}
      {...props}
    />
  );
};
