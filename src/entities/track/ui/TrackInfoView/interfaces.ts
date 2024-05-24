// eslint-disable-next-line boundaries/element-types
import { AudioEditorManager } from '@/entities/audio-editor';

import { TrackInfoProps } from '..';

export interface TrackInfoViewProps extends Omit<TrackInfoProps, 'track'> {
  audioEditorManager: AudioEditorManager;
}
