// eslint-disable-next-line boundaries/element-types
import { AudioEditorManager } from '@/entities/audio-editor';

export interface FadeOverlayProps extends React.ComponentProps<'div'> {
  audioEditorManager: AudioEditorManager;
  side: 'left' | 'right';
}