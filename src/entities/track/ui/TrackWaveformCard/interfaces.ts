import { DetailedHTMLProps, HTMLAttributes } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { Track } from '../../model';

export interface TrackWaveformCardProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  track: Track;
  trackData: Blob | string | undefined;
  onAddTrackBuffer: (trackId: number, trackBuffer: WaveSurfer) => void;
}
