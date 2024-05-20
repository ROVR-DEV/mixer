import { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';

import { AudioEditorManager } from '@/entities/audio-editor';
import { ClockRef } from '@/entities/clock';

export interface TrackInfoPanelProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  clockRef: RefObject<ClockRef>;
  audioEditorManager: AudioEditorManager;
}
