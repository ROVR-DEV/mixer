import { MenuProps } from '@/shared/ui';

export interface TrackEditMenuProps extends Omit<MenuProps, 'ref'> {
  onRename?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSnapLeft?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSnapRight?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onResetFades?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
