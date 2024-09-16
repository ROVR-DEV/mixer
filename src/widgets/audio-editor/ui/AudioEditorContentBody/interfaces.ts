import { RefObject } from 'react';

export interface AudioEditorContentBodyProps
  extends React.ComponentProps<'div'> {
  timelineRef: RefObject<HTMLDivElement>;
}
