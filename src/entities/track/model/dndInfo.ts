import { makeAutoObservable } from 'mobx';

import { DnDInfo } from '@/shared/model/dnd';

export class TrackDnDInfo implements DnDInfo {
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  startTime: number = 0;
  startChannelId?: string = undefined;
  leftBound: number = 0;

  minChannel: number = 0;
  maxChannel: number = Infinity;

  constructor() {
    makeAutoObservable(this);
  }
}
