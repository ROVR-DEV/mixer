'use client';

import { forwardRef, memo, useMemo } from 'react';

import { cn } from '@/shared/lib';
import { IconButton } from '@/shared/ui';
import { MoveIcon } from '@/shared/ui/assets';

import { AudioEditorFloatingToolbarGroup } from '../AudioEditorFloatingToolbarGroup';

import { AudioEditorFloatingToolbarProps } from './interfaces';

export const AudioEditorFloatingToolbar = forwardRef<
  HTMLDivElement,
  AudioEditorFloatingToolbarProps
>(function AudioEditorFloatingToolbar(
  { tools, onMoveHandleMouseDown, onMoveHandleMouseUp, className, ...props },
  ref,
) {
  const groups = useMemo(
    () =>
      tools.map((toolGroup) => (
        <AudioEditorFloatingToolbarGroup key={toolGroup.name} role='group'>
          {toolGroup.buttons.map((toolButton) => (
            <IconButton
              role='listitem'
              key={toolButton.value}
              title={toolButton.label}
              variant={toolButton.isActive ? 'accent' : 'primaryFilled'}
              svgFillType={toolButton.fillType ?? 'stroke'}
              onClick={toolButton.onClick}
            >
              {toolButton.icon}
            </IconButton>
          ))}
        </AudioEditorFloatingToolbarGroup>
      )),
    [tools],
  );

  return (
    <div
      ref={ref}
      className={cn('flex items-center rounded-lg bg-accent', className)}
      {...props}
    >
      <div
        className='cursor-move pl-4'
        onMouseDown={onMoveHandleMouseDown}
        onMouseUp={onMoveHandleMouseUp}
      >
        <MoveIcon />
      </div>
      <div className='flex items-center divide-x divide-primary' role='list'>
        {groups}
      </div>
    </div>
  );
});

export const AudioEditorFloatingToolbarMemoized = memo(
  AudioEditorFloatingToolbar,
);
