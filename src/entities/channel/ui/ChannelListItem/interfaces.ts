export interface ChannelListItemProps extends React.ComponentProps<'div'> {
  disableBorder?: boolean;
  isSelected?: boolean;
  isMuted?: boolean;
  leftPadding?: boolean;
  ignoreSelection?: boolean;
}
