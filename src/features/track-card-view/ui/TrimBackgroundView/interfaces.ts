import { AudioEditorTrack } from '@/entities/track';

export interface TrimBackgroundViewProps extends React.ComponentProps<'div'> {
  track: AudioEditorTrack;
}
