export interface TrackEditMenuProps extends React.ComponentProps<'div'> {
  onRename?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSnapLeft?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSnapRight?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onAddEffect?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
