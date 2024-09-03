import { Timeline } from '@/entities/audio-editor';

export interface TimelineInfoProps extends React.ComponentProps<'div'> {
  timeline: Timeline;
}
