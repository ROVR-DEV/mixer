import { AudioEditorManager, StopButtonProps } from '@/entities/audio-editor';

export interface StopButtonViewProps
  extends Omit<StopButtonProps, 'isPlaying'> {
  audioEditorManager: AudioEditorManager;
}
