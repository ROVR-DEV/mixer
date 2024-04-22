import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

export interface TrackInfoPanelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  onPlay: () => void;
  onStop: () => void;
  playing: boolean;
  time: RefObject<number>;
}
