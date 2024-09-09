import { makeAutoObservable } from 'mobx';

import { DnDInfo } from '@/shared/model/dnd';

export class TrackDnDInfo implements DnDInfo {
  scroll: number = 0;
  isDragging: boolean = false;

  startX: number = 0;
  startY: number = 0;

  startTime: number = 0;

  duration: number = 0;

  startChannelIndex?: number = undefined;

  leftBound: number = 0;
  rightBound: number = Infinity;

  currentX: number = 0;

  minChannel: number = 0;
  maxChannel: number = Infinity;

  constructor() {
    makeAutoObservable(this);
  }
}
