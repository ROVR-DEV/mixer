import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

import { ClockRef } from '@/entities/clock';
import { Track } from '@/entities/track';

export interface TrackInfoPanelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  clockRef: RefObject<ClockRef>;
  onPlay: () => void;
  onStop: () => void;
  playing: boolean;
  selectedTrack: Track | null;
}
