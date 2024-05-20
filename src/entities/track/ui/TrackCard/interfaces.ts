import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Track } from '../../model';

export interface TrackCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  track: Track;
  isSelected?: boolean;
  isSolo?: boolean;
  waveformComponent: JSX.Element;
}
