import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

import { Track } from '@/entities/track';

import { ClockRef } from '../Clock';

export interface TrackInfoPanelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  onPlay: () => void;
  onStop: () => void;
  playing: boolean;
  clockRef: RefObject<ClockRef>;
  selectedTrack: Track | null;
}
