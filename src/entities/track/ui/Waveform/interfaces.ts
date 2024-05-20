import { DetailedHTMLProps, HTMLAttributes } from 'react';
// eslint-disable-next-line import/named
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js';

import { WaveformColor } from './types';

export interface WaveformProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: string | Blob;
  color: WaveformColor;
  options?: Omit<WaveSurferOptions, 'container'>;
  onMount: (wavesurfer: WaveSurfer) => void;
}
