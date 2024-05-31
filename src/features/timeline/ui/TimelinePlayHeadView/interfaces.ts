import { AudioEditorManager } from '@/entities/audio-editor';

import { TimelinePlayHeadProps } from '../TimelinePlayHead';

export interface TimelinePlayHeadViewProps
  extends Omit<TimelinePlayHeadProps, 'ref'> {
  audioEditorManager: AudioEditorManager;
}
