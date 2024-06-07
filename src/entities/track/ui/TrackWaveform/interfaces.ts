// eslint-disable-next-line boundaries/element-types
import { AudioEditorManager } from '@/entities/audio-editor';

import { TrackWithMeta } from '../../model';
import { WaveformProps } from '../Waveform';

export interface TrackWaveformProps
  extends Omit<WaveformProps, 'ref' | 'onMount' | 'isSelected' | 'color'> {
  audioEditorManager: AudioEditorManager;
  track: TrackWithMeta;
  ignoreSelection?: boolean;
}
