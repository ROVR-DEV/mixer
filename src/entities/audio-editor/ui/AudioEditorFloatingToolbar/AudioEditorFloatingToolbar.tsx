import { memo, useMemo } from 'react';

import { cn } from '@/shared/lib';
import { IconButton } from '@/shared/ui';
import {
  CursorIcon,
  FitIcon,
  LoopIcon,
  MagnetIcon,
  MagnifierIcon,
  MoveIcon,
  RedoIcon,
  ScissorsIcon,
  UndoIcon,
} from '@/shared/ui/assets';

import { AUDIO_EDITOR_TOOLS } from '../../config';
import { AudioEditorFloatingToolbarGroup } from '../AudioEditorFloatingToolbarGroup';

import { AudioEditorFloatingToolbarProps } from './interfaces';

export const AudioEditorFloatingToolbar = ({
  onToolChange,
  className,
  ...props
}: AudioEditorFloatingToolbarProps) => {
  const handlers = useMemo(
    () =>
      AUDIO_EDITOR_TOOLS.reduce<Map<string, () => void>>(
        (acc, tool) => acc.set(tool, () => onToolChange?.(tool)),
        new Map(),
      ),
    [onToolChange],
  );

  return (
    <div
      className={cn(
        'flex items-center rounded-lg bg-accent divide-x divide-primary',
        className,
      )}
      {...props}
    >
      <AudioEditorFloatingToolbarGroup>
        <div className='cursor-move'>
          <MoveIcon />
        </div>
        <IconButton
          variant='inverse'
          svgFillType='stroke'
          onClick={handlers.get('cursor')}
        >
          <CursorIcon />
        </IconButton>
        <IconButton variant='unstyled' onClick={handlers.get('scissors')}>
          <ScissorsIcon />
        </IconButton>
        <IconButton variant='unstyled' onClick={handlers.get('magnifier')}>
          <MagnifierIcon />
        </IconButton>
      </AudioEditorFloatingToolbarGroup>
      <AudioEditorFloatingToolbarGroup>
        <IconButton variant='unstyled' onClick={handlers.get('repeat')}>
          <LoopIcon />
        </IconButton>
        <IconButton variant='unstyled' onClick={handlers.get('fit')}>
          <FitIcon />
        </IconButton>
        <IconButton variant='unstyled' onClick={handlers.get('magnet')}>
          <MagnetIcon />
        </IconButton>
      </AudioEditorFloatingToolbarGroup>
      <AudioEditorFloatingToolbarGroup>
        <IconButton variant='unstyled' onClick={handlers.get('undo')}>
          <UndoIcon />
        </IconButton>
        <IconButton variant='unstyled' onClick={handlers.get('redo')}>
          <RedoIcon />
        </IconButton>
      </AudioEditorFloatingToolbarGroup>
    </div>
  );
};

export const AudioEditorFloatingToolbarMemoized = memo(
  AudioEditorFloatingToolbar,
);
