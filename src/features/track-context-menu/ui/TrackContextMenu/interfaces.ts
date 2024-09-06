import { MenuProps } from '@/shared/ui';

import { AudioEditorTrack } from '@/entities/track';

export interface TrackContextMenuProps extends Omit<MenuProps, 'ref'> {
  track: AudioEditorTrack;
}
