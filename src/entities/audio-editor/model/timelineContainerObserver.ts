import { computed, makeAutoObservable, runInAction } from 'mobx';
import { RefObject } from 'react';

import { Rect } from '@/shared/model';

export type TimelineContainerSizeListener = (
  timelineClientWidth: number,
  timelineScrollWidth: number,
  timelineClientHeight: number,
  pixelsPerSecond: number,
  size: Rect | null,
) => void;

export class TimelineContainerObserver {
  private _timelineRef: RefObject<HTMLElement | null>;
  private _timelineSize: Rect | null = null;
  private _timelineBoundingBox: Rect | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  private _totalTime = 0;
  private _dpi = 1;
  private _pixelsPerSecond = 1;

  private _listeners: Set<TimelineContainerSizeListener> = new Set();

  get timelineRef(): RefObject<HTMLElement | null> {
    return this._timelineRef;
  }

  set timelineRef(timelineRef: RefObject<HTMLElement | null>) {
    if (!timelineRef.current) {
      return;
    }

    this._timelineRef = timelineRef;
    this._setupResizeObserver();
  }

  get totalTime(): number {
    return this._totalTime;
  }

  set totalTime(time: number) {
    this._totalTime = time;
  }

  get dpi(): number {
    return this._dpi;
  }

  set dpi(dpi: number) {
    this._dpi = dpi;
    this._triggerAllListeners();
  }

  get pixelsPerSecond(): number {
    return this._pixelsPerSecond;
  }

  set pixelsPerSecond(pixelsPerSecond: number) {
    this._pixelsPerSecond = pixelsPerSecond;
    this._triggerAllListeners();
  }

  get timelineClientWidth(): number {
    return this._timelineSize?.width ?? 1440;
  }

  get timelineScrollWidth(): number {
    return Math.max(
      this.timelineClientWidth,
      this._totalTime * this._pixelsPerSecond * this._dpi,
    );
  }

  get timelineClientHeight(): number {
    return this._timelineSize?.height ?? 0;
  }

  get maxScroll(): number {
    return this.timelineScrollWidth - this.timelineClientWidth;
  }

  constructor(timelineRef: RefObject<HTMLElement>, totalTime: number) {
    this._timelineRef = timelineRef;
    this._totalTime = totalTime;

    this._setupResizeObserver();
    makeAutoObservable(this, { totalTime: computed });
  }

  private _setupResizeObserver = () => {
    if (!this._timelineRef.current) {
      return;
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver((entries) => {
        runInAction(() => {
          this._timelineSize = entries[0].contentRect;
          this._timelineBoundingBox =
            this.timelineRef.current?.getBoundingClientRect() ?? null;
          this._triggerAllListeners();
        });
      });
    }

    this._resizeObserver.observe(this._timelineRef.current);
  };

  private _triggerAllListeners = () => {
    this._listeners.forEach((listener) =>
      listener(
        this.timelineClientWidth,
        this.timelineScrollWidth,
        this.timelineClientHeight,
        this.pixelsPerSecond,
        this._timelineBoundingBox,
      ),
    );
  };

  addListener = (listener: TimelineContainerSizeListener) => {
    this._listeners.add(listener);
  };

  removeListeners = (listener: TimelineContainerSizeListener) => {
    this._listeners.delete(listener);
  };
}
