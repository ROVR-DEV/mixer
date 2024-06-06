import { makeAutoObservable, runInAction } from 'mobx';
import { RefObject } from 'react';

import {
  TimelineTicks,
  getPixelPerSeconds,
  getTicksForSeconds,
  // eslint-disable-next-line boundaries/element-types
} from '@/features/timeline';

import { ScrollController } from './scrollController';
import { TimelineContainerObserver } from './timelineContainerObserver';
import { ZoomController } from './zoomController';

export interface TimelineControllerProps {
  timelineRef: RefObject<HTMLElement>;
  zoomStep: number;
  scrollStep: number;
  minZoom: number;
  maxZoom: number;
  minScroll: number;
  maxScroll?: number;
  totalTime: number;
  timelineLeftPadding?: number;
}

export type WheelEventListener = (e: WheelEvent) => void;

export class TimelineController {
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

  private _trackHeight: number | string = 96;

  get trackHeight(): number | string {
    return this._trackHeight;
  }

  set trackHeight(trackHeight: number | string) {
    this._trackHeight = trackHeight;
  }

  startPageX: number;
  endPageX: number;

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
    this._zoom = zoom;
  }

  get scroll() {
    return this._scroll;
  }

  set scroll(scroll: number) {
    this._scroll = scroll;
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
    timelineLeftPadding = 0,
  }: TimelineControllerProps) {
    this.zoomController = new ZoomController(zoomStep, minZoom, maxZoom);

    this.scrollController = new ScrollController(
      scrollStep,
      minScroll,
      maxScroll ?? 100,
    );

    this.timelineContainer = new TimelineContainerObserver(
      timelineRef,
      totalTime,
    );

    this._zoom = this.zoomController.value;
    this._scroll = this.scrollController.value;

    this._timelineClientWidth = this.timelineContainer.timelineClientWidth;
    this._timelineScrollWidth = this.timelineContainer.timelineScrollWidth;
    this._timelineClientHeight = this.timelineContainer.timelineClientHeight;
    this._pixelsPerSecond = this.timelineContainer.pixelsPerSecond;

    this._timelineLeftPadding = timelineLeftPadding;

    this.startPageX =
      this.timelineContainer.timelineRef.current?.getBoundingClientRect().x ??
      0;
    this.endPageX = this.timelineContainer.timelineClientWidth;

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
    );

    makeAutoObservable(this);
  }

  get ticks(): TimelineTicks {
    return getTicksForSeconds(
      this.timelineClientWidth,
      this.zoom,
      this.scroll * this.timelineContainer.pixelsPerSecond,
    );
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

  realGlobalPixelsToLocal = (x: number) => {
    return x - this._scroll;
  };

  realLocalPixelsToGlobal = (x: number) => {
    return x + this._scroll;
  };

  virtualToRealPixels = (x: number) => {
    return (
      (x - this._timelineLeftPadding) / this.timelineContainer.pixelsPerSecond
    );
  };

  virtualToRealGlobalPixels = (x: number) => {
    return this.realLocalPixelsToGlobal(this.virtualToRealPixels(x));
  };

  realToVirtualPixels = (x: number) => {
    return (
      x * this.timelineContainer.pixelsPerSecond - this._timelineLeftPadding
    );
  };

  timeToVirtualPixels = (time: number) => {
    return time * this.timelineContainer.pixelsPerSecond;
  };

  private _wheelListener = (e: WheelEvent) => {
    this._wheelListeners.forEach((listener) => listener(e));
  };

  private _timelineListener = (
    timelineClientWidth: number,
    timelineScrollWidth: number,
    timelineClientHeight: number,
    pixelsPerSecond: number,
  ) => {
    runInAction(() => {
      this.scrollController.max =
        (timelineScrollWidth - timelineClientWidth) / pixelsPerSecond;

      this._timelineClientHeight = timelineClientHeight;
      this._timelineClientWidth = timelineClientWidth;
      this._timelineScrollWidth = timelineScrollWidth;
      this._pixelsPerSecond = pixelsPerSecond;

      this.startPageX =
        this.timelineContainer.timelineRef.current?.getBoundingClientRect().x ??
        0;
      this.endPageX = this.timelineContainer.timelineClientWidth;
    });
  };

  private _scrollListener = (scroll: number) => {
    runInAction(() => {
      this.scroll = scroll;
    });
  };

  private _zoomListener = (zoom: number) => {
    runInAction(() => {
      this.timelineContainer.pixelsPerSecond = getPixelPerSeconds(zoom);
      this.zoom = zoom;
    });
  };
}
