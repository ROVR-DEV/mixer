import { TimelineScrollProps } from '../TimelineScroll';

export interface TimelineScrollViewProps
  extends Omit<
    TimelineScrollProps,
    'ref' | 'scrollDivRef' | 'timelineScrollWidth'
  > {}
