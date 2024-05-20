import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { PlaylistDTO } from '@/entities/playlist';

export interface TimelineProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  playlist: PlaylistDTO;
}
