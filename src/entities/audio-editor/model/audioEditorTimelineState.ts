import { makeAutoObservable } from 'mobx';

export class AudioEditorTimelineState {
  timelineLeftPadding: number = 0;

  startPageX: number = 0;
  endPageX: number = Infinity;

  zoom: number = 1;
  scroll: number = 0;
  pixelsPerSecond: number = 1;

  constructor() {
    makeAutoObservable(this);
  }

  setTimelineLeftPadding = (timelineLeftPadding: number) => {
    this.timelineLeftPadding = timelineLeftPadding;
  };

  setBounds = (startX: number, endX: number) => {
    this.startPageX = startX;
    this.endPageX = endX;
  };

  setProperties = ({
    zoom,
    scroll,
    pixelsPerSecond,
  }: {
    zoom: number;
    scroll: number;
    pixelsPerSecond: number;
  }) => {
    this.zoom = zoom;
    this.scroll = scroll;
    this.pixelsPerSecond = pixelsPerSecond;
  };
}
