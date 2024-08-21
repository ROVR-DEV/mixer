import { RefObject } from 'react';

export interface AudioEditorContentBodyProps
  extends React.ComponentProps<'div'> {
  rulerWrapperRef: RefObject<HTMLDivElement>;
  timelineRef: RefObject<HTMLDivElement>;
}
