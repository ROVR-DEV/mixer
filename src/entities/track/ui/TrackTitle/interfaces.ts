import { Track } from '../../model';

export interface TrackTitleProps extends React.ComponentProps<'span'> {
  track?: Track | null;
  isEditing?: boolean;
  onEdited?: (title: string | undefined, artist: string | undefined) => void;
}
