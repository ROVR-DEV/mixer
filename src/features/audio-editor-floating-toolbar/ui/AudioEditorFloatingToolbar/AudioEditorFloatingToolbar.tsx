import { memo } from 'react';

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

import { AudioEditorFloatingToolbarGroup } from '../AudioEditorFloatingToolbarGroup';

import { AudioEditorFloatingToolbarProps } from './interfaces';

export const AudioEditorFloatingToolbar = ({
  className,
  ...props
}: AudioEditorFloatingToolbarProps) => {
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
        <IconButton variant='inverse' svgFillType='stroke'>
          <CursorIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <ScissorsIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <MagnifierIcon />
        </IconButton>
      </AudioEditorFloatingToolbarGroup>
      <AudioEditorFloatingToolbarGroup>
        <IconButton variant='unstyled'>
          <LoopIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <FitIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <MagnetIcon />
        </IconButton>
      </AudioEditorFloatingToolbarGroup>
      <AudioEditorFloatingToolbarGroup>
        <IconButton variant='unstyled'>
          <UndoIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <RedoIcon />
        </IconButton>
      </AudioEditorFloatingToolbarGroup>
    </div>
  );
};

export const AudioEditorFloatingToolbarMemoized = memo(
  AudioEditorFloatingToolbar,
);
