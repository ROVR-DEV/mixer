import { AudioEditorManager } from '@/entities/audio-editor';

export interface TrackEditorProps extends React.ComponentProps<'div'> {
  audioEditorManager: AudioEditorManager;
}
