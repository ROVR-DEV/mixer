export interface ChannelListItemProps extends React.ComponentProps<'div'> {
  isSelected?: boolean;
  isMuted?: boolean;
  leftPadding?: boolean;
  ignoreSelection?: boolean;
}
