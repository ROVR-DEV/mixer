import { AudioEditorManager } from '@/entities/audio-editor';

export interface TrackInfoPanelProps extends React.ComponentProps<'div'> {
  audioEditorManager: AudioEditorManager;
}
