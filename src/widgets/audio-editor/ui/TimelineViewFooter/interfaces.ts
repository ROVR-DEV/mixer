import { TimelineController } from '@/entities/audio-editor';

export interface TimelineViewFooterProps extends React.ComponentProps<'div'> {
  timelineController: TimelineController;
}
