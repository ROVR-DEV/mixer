import { TimelineScrollProps } from '../TimelineScroll';

export interface Timeline2ScrollViewProps
  extends Omit<
    TimelineScrollProps,
    'ref' | 'scrollDivRef' | 'timelineScrollWidth'
  > {}
