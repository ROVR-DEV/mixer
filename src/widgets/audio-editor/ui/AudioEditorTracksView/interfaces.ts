import { Player } from '@/entities/audio-editor';
import { Channel } from '@/entities/channel';

export interface AudioEditorTracksViewProps {
  channel: Channel;
  player: Player;
}
