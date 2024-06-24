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

import { AudioEditorTool } from '../../model';
import { AudioEditorFloatingToolbarGroup } from '../AudioEditorFloatingToolbarGroup';

import { AudioEditorFloatingToolbarProps } from './interfaces';

const TOOL_ICONS: Record<AudioEditorTool, JSX.Element> = {
  cursor: <CursorIcon />,
  scissors: <ScissorsIcon />,
  magnifier: <MagnifierIcon />,
  repeat: <LoopIcon />,
  fit: <FitIcon />,
  magnet: <MagnetIcon />,
  undo: <UndoIcon />,
  redo: <RedoIcon />,
};

export const AudioEditorFloatingToolbar = ({
  currentTool,
  tools,
  onToolChange,
  className,
  ...props
}: AudioEditorFloatingToolbarProps) => {
  const groups = useMemo(() => {
    return tools.map((toolGroup) => (
      <AudioEditorFloatingToolbarGroup key={`group[${toolGroup.join(',')}]`}>
        {toolGroup.map((tool) => (
          <IconButton
            key={tool}
            disabled={!(tool === 'cursor' || tool === 'scissors')}
            variant={currentTool === tool ? 'inverse' : 'primaryFilled'}
            svgFillType={tool !== 'fit' ? 'stroke' : 'fill'}
            onClick={() => onToolChange?.(tool)}
          >
            {TOOL_ICONS[tool]}
          </IconButton>
        ))}
      </AudioEditorFloatingToolbarGroup>
    ));
  }, [currentTool, onToolChange, tools]);

  return (
    <div
      className={cn('flex items-center rounded-lg bg-accent', className)}
      {...props}
    >
      <div className='cursor-move pl-4'>
        <MoveIcon />
      </div>
      <div className='flex items-center divide-x divide-primary'>{groups}</div>
    </div>
  );
};

export const AudioEditorFloatingToolbarMemoized = memo(
  AudioEditorFloatingToolbar,
);
