import { RefObject } from 'react';

import { AudioEditorManager } from '@/entities/audio-editor';

import { TimelineGridRef } from '@/features/timeline';

export interface TimelineProps extends React.ComponentProps<'div'> {
  audioEditorManager: AudioEditorManager;
  timelineRef: RefObject<HTMLDivElement>;
  gridRef: RefObject<TimelineGridRef>;
}
