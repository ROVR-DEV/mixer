import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Track } from '../../model';

export interface TrackInfoProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  track: Track | null;
}
