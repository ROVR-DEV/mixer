import { AudioEditorManager } from '@/entities/audio-editor';

export interface AudioEditorTracksListProps {
  audioEditorManager: AudioEditorManager;
  tracksData: Record<string, string | Blob | undefined>;
}
