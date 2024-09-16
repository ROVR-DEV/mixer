import { ReactNode } from 'react';

import { Point, Rect } from '@/shared/model';

import { Track } from '../../model';

export interface TrackCardProps extends React.ComponentProps<'div'> {
  track: Track;
  waveformComponent: JSX.Element | null;
  isSelected?: boolean;
  isSolo?: boolean;
  color?: string;
  hideTitle?: boolean;
  editPopoverContent?: ReactNode;
  isEditingName?: boolean;
  hideEditButton?: boolean;
  onNameEdited?: (
    title: string | undefined,
    artist: string | undefined,
  ) => void;
  contextMenuPosition?: Point;
  contextMenuContent?: ReactNode;
  popoverBoundary?: Rect;
}
