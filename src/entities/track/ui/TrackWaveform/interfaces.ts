// eslint-disable-next-line boundaries/element-types
import { AudioEditorManager } from '@/entities/audio-editor';

import { AudioEditorTrack } from '../../model';
import { WaveformProps } from '../Waveform';

export interface TrackWaveformProps
  extends Omit<
    WaveformProps,
    'ref' | 'onMount' | 'isSelected' | 'color' | 'waveColor'
  > {
  audioEditorManager: AudioEditorManager;
  track: AudioEditorTrack;
  ignoreSelection?: boolean;
}
