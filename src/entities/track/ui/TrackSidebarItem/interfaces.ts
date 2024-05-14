import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface TrackSidebarItemProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  disableBorder?: boolean;
  isSelected?: boolean;
  translucentBackgroundWhenSelected?: boolean;
}
