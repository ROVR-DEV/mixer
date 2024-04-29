import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

import { ClockRef } from '../Clock';

export interface TrackInfoPanelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  onPlay: () => void;
  onStop: () => void;
  playing: boolean;
  clockRef: RefObject<ClockRef>;
}
