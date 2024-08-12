import { MenuProps } from '@/shared/ui';

export interface TrackImportMenuProps extends Omit<MenuProps, 'ref'> {
  onAddToTheEnd: () => void;
  onAddToNewChannel: () => void;
  onReplaceExisting: () => void;
}
