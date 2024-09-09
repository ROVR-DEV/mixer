import { makeAutoObservable, runInAction } from 'mobx';
import { RefObject } from 'react';

import { clamp } from '@/shared/lib';
import { Rect } from '@/shared/model';

import {
  TimelineTicks,
  getPixelPerSeconds,
  getTicksForSeconds,
  // eslint-disable-next-line boundaries/element-types
} from '@/features/timeline';

import { ScrollController } from './scrollController';
import { TimelineContainerObserver } from './timelineContainerObserver';
import { ZoomController } from './zoomController';

export interface TimelineProps {
  timelineRef: RefObject<HTMLElement>;
  zoomStep: number;
  scrollStep: number;
  minZoom: number;
  maxZoom: number;
  minScroll: number;
  maxScroll?: number;
  totalTime?: number;
  startTime?: number;
  endTime: number;
  timelineLeftPadding?: number;
}

export type WheelEventListener = (e: WheelEvent) => void;

export class Timeline {
  readonly zoomController: ZoomController;
  readonly scrollController: ScrollController;
  readonly timelineContainer: TimelineContainerObserver;

  private _timelineClientHeight: number;
  private _timelineClientWidth: number;
  private _timelineScrollWidth: number;
  private _pixelsPerSecond: number;

  private _timelineLeftPadding: number;

  private _zoom: number;
  private _scroll: number;

  private _wheelListeners: Set<WheelEventListener> = new Set();
  private _wheelEventTriggerElements: Set<RefObject<HTMLElement>> = new Set();

  private _trackHeight: number | string = 98;

  private _disableListeners: boolean = false;

  boundingClientRect: Rect;

  totalTime: number;

  startTime: number;
  endTime: number;

  endBorderWidth: number = 20;

  get disableListeners(): boolean {
    return this._disableListeners;
  }
  set disableListeners(value: boolean) {
    this._disableListeners = value;
    this.zoomController.disableListeners = value;
    this.scrollController.disableListeners = value;
  }

  get trackHeight(): number | string {
    return this._trackHeight;
  }

  set trackHeight(trackHeight: number | string) {
    this._trackHeight = trackHeight;
  }

  get timelineClientWidth() {
    return this._timelineClientWidth;
  }

  get timelineScrollWidth() {
    return this._timelineScrollWidth;
  }

  get timelineClientHeight() {
    return this._timelineClientHeight;
  }

  get pixelsPerSecond() {
    return this._pixelsPerSecond;
  }

  get timelineLeftPadding() {
    return this._timelineLeftPadding;
  }

  set timelineLeftPadding(timelineLeftPadding: number) {
    this._timelineLeftPadding = timelineLeftPadding;
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(zoom: number) {
    this.zoomController.value = zoom;
  }

  get scroll() {
    return this._scroll;
  }

  set scroll(scroll: number) {
    this.scrollController.value = scroll;
  }

  constructor({
    timelineRef,
    zoomStep,
    minZoom,
    maxZoom,
    scrollStep,
    minScroll,
    maxScroll,
    totalTime,
    startTime = 0,
    endTime,
    timelineLeftPadding = 0,
  }: TimelineProps) {
    this.totalTime = totalTime ?? endTime + 6;

    this.zoomController = new ZoomController(zoomStep, minZoom, maxZoom);

    this.scrollController = new ScrollController(
      scrollStep,
      minScroll,
      maxScroll ?? this.totalTime,
    );

    this.timelineContainer = new TimelineContainerObserver(
      timelineRef,
      this.totalTime,
    );

    this.startTime = startTime;
    this.endTime = endTime;

    this._zoom = this.zoomController.value;
    this._scroll = this.scrollController.value;

    this._timelineClientWidth = this.timelineContainer.timelineClientWidth;
    this._timelineScrollWidth = this.timelineContainer.timelineScrollWidth;
    this._timelineClientHeight = this.timelineContainer.timelineClientHeight;
    this._pixelsPerSecond = this.timelineContainer.pixelsPerSecond;

    this._timelineLeftPadding = timelineLeftPadding;

    this.boundingClientRect =
      this.timelineContainer.timelineRef.current?.getBoundingClientRect() ??
      new Rect(0, 0, 0, 0);

    this.zoomController.addListener(this._zoomListener);
    this.scrollController.addListener(this._scrollListener);
    this.timelineContainer.addListener(this._timelineListener);

    this._zoomListener(this.zoomController.value);
    this._scrollListener(this.scrollController.value);
    this._timelineListener(
      this.timelineContainer.timelineClientWidth,
      this.timelineContainer.timelineScrollWidth,
      this.timelineContainer.timelineClientHeight,
      this.timelineContainer.pixelsPerSecond,
      new Rect(0, 0, 0, 0),
    );

    makeAutoObservable(this);
  }

  get ticks(): TimelineTicks {
    return getTicksForSeconds(this.timelineClientWidth, this.zoom, this.scroll);
  }

  addWheelListener = (listener: WheelEventListener) => {
    this._wheelListeners.add(listener);
  };

  removeWheelListener = (listener: WheelEventListener) => {
    this._wheelListeners.delete(listener);
  };

  addWheelTriggerElement = (element: RefObject<HTMLElement>) => {
    if (!element.current || this._wheelEventTriggerElements.has(element)) {
      return;
    }

    element.current.addEventListener('wheel', this._wheelListener, {
      passive: false,
    });
    this._wheelEventTriggerElements.add(element);
  };

  removeWheelTriggerElement = (element: RefObject<HTMLElement>) => {
    if (!element.current) {
      return;
    }

    element.current.removeEventListener('wheel', this._wheelListener);
    this._wheelEventTriggerElements.delete(element);
  };

  /**
   * @description Map pixels relative to the timeline container view with scroll to time
   * @param x x coordinate in pixels
   * @param isPageCoordinates is the x coordinate relative to the page or to the timeline container
   * @returns time in seconds
   */
  globalToTime = (x: number, isPageCoordinates: boolean = true) => {
    if (isPageCoordinates) {
      x -= this.boundingClientRect.x;
    }

    x -= this.timelineLeftPadding;

    x += this.scroll;

    x /= this.pixelsPerSecond;

    return x;
  };

  /**
   * @description Map pixels relative to the timeline container except scroll to time
   * @param x x coordinate in pixels
   * @param isPageCoordinates is the x coordinate relative to the page or to the timeline container
   * @returns time in seconds
   */
  localToTime = (x: number, isPageCoordinates: boolean = true): number => {
    if (isPageCoordinates) {
      x -= this.boundingClientRect.x;
    }

    x -= this.timelineLeftPadding;

    x /= this.pixelsPerSecond;

    return x;
  };

  /**
   *
   * @param time time in seconds
   * @returns x coordinate in pixels relative to the timeline container view with scroll
   */
  timeToGlobal = (time: number): number => {
    return time * this.pixelsPerSecond + this.timelineLeftPadding;
  };

  /**
   *
   * @param time time in seconds
   * @returns x coordinate in pixels relative to the timeline container without scroll
   */
  timeToLocal = (time: number): number => {
    return time * this.pixelsPerSecond + this.timelineLeftPadding - this.scroll;
  };

  /**
   * @description Convert time to pixels
   * @param time time in seconds
   * @returns pixels
   */
  timeToPixels = (time: number): number => {
    return time * this.pixelsPerSecond;
  };

  /**
   * @description Convert pixels to time
   * @param x pixels
   * @returns time in seconds
   */
  pixelsToTime = (x: number): number => {
    return x * this.pixelsPerSecond;
  };

  setViewBoundsInPixels = (startX: number, endX: number): void => {
    runInAction(() => {
      const startTime = clamp(this.localToTime(startX, false), 0);
      const newZoom = clamp(this._getNewZoomToReachBounds(startX, endX), 0.1);

      if (!isNaN(newZoom)) {
        this.zoom = newZoom;
      }

      this.scroll = this.timeToPixels(startTime);
    });
  };

  private _getNewZoomToReachBounds = (start: number, end: number) => {
    const distance = end - start;
    const zoomDifference =
      this.timelineContainer.timelineClientWidth / distance;

    if (zoomDifference < this.zoomController.step) {
      return this.zoom * zoomDifference;
    }

    return (
      this.zoom *
      Math.floor(zoomDifference / this.zoomController.step) *
      this.zoomController.step
    );
  };

  private _wheelListener = (e: WheelEvent) => {
    if (this.disableListeners) {
      return;
    }

    this._wheelListeners.forEach((listener) => listener(e));
  };

  private _timelineListener = (
    timelineClientWidth: number,
    timelineScrollWidth: number,
    timelineClientHeight: number,
    pixelsPerSecond: number,
    size: Rect | null,
  ) => {
    runInAction(() => {
      this.scrollController.min = this.startTime * pixelsPerSecond;
      this.scrollController.max =
        timelineScrollWidth -
        timelineClientWidth +
        this.startTime * pixelsPerSecond;

      this._timelineClientHeight = timelineClientHeight;
      this._timelineClientWidth = timelineClientWidth;
      this._timelineScrollWidth = timelineScrollWidth;
      this._pixelsPerSecond = pixelsPerSecond;

      this.boundingClientRect = size ?? new Rect(0, 0, 0, 0);
    });
  };

  private _scrollListener = (scroll: number) => {
    runInAction(() => {
      this._scroll = scroll;
    });
  };

  private _zoomListener = (zoom: number) => {
    runInAction(() => {
      this.timelineContainer.pixelsPerSecond = getPixelPerSeconds(zoom);
      this._zoom = zoom;
    });
  };
}
