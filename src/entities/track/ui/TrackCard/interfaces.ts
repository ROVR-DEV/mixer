import { ReactNode } from 'react';

import { Track } from '../../model';

export interface TrackCardProps extends React.ComponentProps<'div'> {
  track: Track;
  waveformComponent: JSX.Element;
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
}
