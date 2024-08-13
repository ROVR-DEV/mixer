import { MenuProps } from '@/shared/ui';

export interface TrackContextMenuProps extends Omit<MenuProps, 'ref'> {
  onTrackRemove: () => void;
}
