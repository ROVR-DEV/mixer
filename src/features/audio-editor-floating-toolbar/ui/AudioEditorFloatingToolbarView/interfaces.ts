import { AudioEditorFloatingToolbarProps } from '@/entities/audio-editor';

export interface AudioEditorFloatingToolbarViewProps
  extends Omit<
    AudioEditorFloatingToolbarProps,
    'ref' | 'currentTool' | 'tools' | 'onToolChange'
  > {}
