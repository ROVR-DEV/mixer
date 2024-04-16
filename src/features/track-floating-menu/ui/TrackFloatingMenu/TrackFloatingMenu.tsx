import { cn } from '@/shared/lib/cn';
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

import { TrackFloatingMenuGroup } from '../TrackFloatingMenuGroup';

import { TrackFloatingMenuProps } from './interfaces';

export const TrackFloatingMenu = ({
  className,
  ...props
}: TrackFloatingMenuProps) => {
  return (
    <div
      className={cn(
        'flex items-center rounded-lg bg-accent divide-x-[3px] divide-secondary/30',
        className,
      )}
      {...props}
    >
      <TrackFloatingMenuGroup>
        <MoveIcon />
        <IconButton variant='inverse'>
          <CursorIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <ScissorsIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <MagnifierIcon />
        </IconButton>
      </TrackFloatingMenuGroup>
      <TrackFloatingMenuGroup>
        <IconButton variant='unstyled'>
          <LoopIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <FitIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <MagnetIcon />
        </IconButton>
      </TrackFloatingMenuGroup>
      <TrackFloatingMenuGroup>
        <IconButton variant='unstyled'>
          <UndoIcon />
        </IconButton>
        <IconButton variant='unstyled'>
          <RedoIcon />
        </IconButton>
      </TrackFloatingMenuGroup>
    </div>
  );
};
