import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Playlist } from '@/entities/track';

export interface TimelineProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  playlist: Playlist;
}
