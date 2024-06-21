import {
  AudioEditorFloatingToolbarProps,
  AudioEditorManager,
} from '@/entities/audio-editor';

export interface AudioEditorFloatingToolbarViewProps
  extends Omit<AudioEditorFloatingToolbarProps, 'ref' | 'onToolChange'> {
  audioEditorManager: AudioEditorManager;
}
