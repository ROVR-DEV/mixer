// eslint-disable-next-line boundaries/element-types
import { Player } from '@/entities/audio-editor';

import { AudioEditorTrack } from '../../model';
import { WaveformProps } from '../Waveform';

export interface TrackWaveformProps
  extends Omit<
    WaveformProps,
    'ref' | 'onMount' | 'isSelected' | 'color' | 'waveColor'
  > {
  player: Player;
  track: AudioEditorTrack;
  ignoreSelection?: boolean;
}
