import { RefObject } from 'react';

import { AudioEditorManager } from '@/entities/audio-editor';

import { TimelineRulerRef } from '@/features/timeline';

export interface TimelineHeaderProps extends React.ComponentProps<'div'> {
  audioEditorManager: AudioEditorManager;
  rulerRef: RefObject<HTMLDivElement>;
  controlRef: RefObject<TimelineRulerRef>;
  centerLine?: boolean;
}
