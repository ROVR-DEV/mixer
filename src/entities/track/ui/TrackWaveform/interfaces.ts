import { AudioEditorTrack } from '../../model';
import { WaveformProps } from '../Waveform';

export interface TrackWaveformProps
  extends Omit<
    WaveformProps,
    'ref' | 'onMount' | 'isSelected' | 'color' | 'waveColor'
  > {
  track: AudioEditorTrack;
  ignoreSelection?: boolean;
}
