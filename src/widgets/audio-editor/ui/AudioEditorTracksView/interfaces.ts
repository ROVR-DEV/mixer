import { AudioEditorManager } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';

export interface AudioEditorTracksViewProps {
  channel: Channel;
  tracksData: Record<string, string | Blob | undefined>;
  audioEditorManager: AudioEditorManager;
}
