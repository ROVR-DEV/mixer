import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Track } from '../../model';

export interface TrackWaveformCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  track: Track;
}
