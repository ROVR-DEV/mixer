// eslint-disable-next-line import/named
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js';

import { WaveformColor } from './types';

export interface WaveformProps extends React.ComponentProps<'div'> {
  data?: string | Blob | null;
  color: WaveformColor;
  options?: Omit<WaveSurferOptions, 'container'>;
  onMount: (wavesurfer: WaveSurfer) => void;
}
