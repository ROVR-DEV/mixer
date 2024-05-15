import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Playlist } from '@/entities/playlist';

export interface TimelineProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  playlist: Playlist;
}
