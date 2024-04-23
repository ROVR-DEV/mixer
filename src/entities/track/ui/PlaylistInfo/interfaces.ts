import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface PlaylistInfoProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  totalPlaytime: number;
  tracksCount: number;
}
