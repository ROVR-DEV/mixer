import { computed, makeAutoObservable, runInAction } from 'mobx';

import { clamp } from '@/shared/lib';
import { Bounds, Rect } from '@/shared/model';

import {
  TimelineTicks,
  getPixelPerSeconds,
  getTicksForSeconds,
  // eslint-disable-next-line boundaries/element-types
} from '@/features/timeline';

import { ScrollController } from './scrollController';
import { ZoomController } from './zoomController';

export interface TimelineProps {
  container: HTMLElement | null;
  zoomStep: number;
  scrollStep: number;
  minZoom: number;
  maxZoom: number;
  minScroll: number;
  maxScroll?: number;
  startTime?: number;
  endTime: number;
  zeroMarkOffsetX?: number;
  trackHeight?: number | string;
}

export class Timeline {
  readonly zoomController: ZoomController;
  readonly hScrollController: ScrollController;

  viewportBoundsBufferWidth = 100;
  endBorderWidth: number = 20;

  private _container: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  private _boundingClientRect: Rect = new Rect();

  private _disableListeners: boolean = false;

  private _interactedBefore: boolean = false;

  private _hScroll: number = 0;

  private _dpi: number = 1;

  private _zoom: number = 1;

  private _hPixelsPerSecond: number = 1;

  private _startTime: number;
  private _endTime: number;

  private _zeroMarkOffsetX: number;
  private _trackHeight: number | string = 98;

  //#region Getters/Setters

  get container(): HTMLElement | null {
    return this._container;
  }
  set container(value: HTMLElement | null) {
    this._container = value;
    if (typeof window !== 'undefined') {
      this._setupResizeObserver();
    }
  }

  get boundingClientRect(): Rect {
    return this._boundingClientRect;
  }

  get clientWidth(): number {
    return (
      (this._boundingClientRect.width || this._container?.clientWidth) ?? 0
    );
  }

  get scrollWidth(): number {
    return Math.max(
      this.clientWidth,
      (this._endTime - this._startTime) * this._hPixelsPerSecond +
        this.zeroMarkOffsetX +
        this.endBorderWidth,
    );
  }

  get clientHeight(): number {
    return (
      (this._boundingClientRect.height || this._container?.clientHeight) ?? 0
    );
  }

  get viewportBounds(): Bounds {
    return {
      start: clamp(this.hScroll, 0),
      end: clamp(
        this.hScroll + this.clientWidth,
        0,
        this.timeToGlobal(this.endTime),
      ),
    };
  }

  get viewportBoundsWithBuffer(): Bounds {
    return {
      start: clamp(this.hScroll - this.viewportBoundsBufferWidth, 0),
      end: clamp(
        this.hScroll + this.clientWidth + this.viewportBoundsBufferWidth,
        0,
        Infinity,
      ),
    };
  }

  get interactedBefore(): boolean {
    return this._interactedBefore;
  }
  set interactedBefore(value: boolean) {
    this._interactedBefore = value;
  }

  get hScroll() {
    return this._hScroll;
  }
  set hScroll(value: number) {
    this.hScrollController.value = value;
  }

  get dpi(): number {
    return this._dpi;
  }

  get zoom() {
    return this._zoom;
  }
  set zoom(value: number) {
    this.zoomController.value = value;
  }

  get disableListeners(): boolean {
    return this._disableListeners;
  }
  set disableListeners(value: boolean) {
    this._disableListeners = value;
    this.zoomController.disableListeners = value;
    this.hScrollController.disableListeners = value;
  }

  get hPixelsPerSecond() {
    return this._hPixelsPerSecond;
  }

  get startTime(): number {
    return this._startTime;
  }
  set startTime(value: number) {
    this._startTime = value;
    this._updateScrollControllerBounds();
  }

  get endTime(): number {
    return this._endTime;
  }
  set endTime(value: number) {
    this._endTime = value;
    this._updateScrollControllerBounds();
  }

  get zeroMarkOffsetX() {
    return this._zeroMarkOffsetX;
  }
  set zeroMarkOffsetX(value: number) {
    this._zeroMarkOffsetX = value;
  }

  get trackHeight(): number | string {
    return this._trackHeight;
  }
  set trackHeight(value: number | string) {
    this._trackHeight = value;
  }

  get ticks(): TimelineTicks {
    return getTicksForSeconds(this.clientWidth, this.zoom, this.hScroll);
  }
  //#endregion

  constructor({
    container: container,
    zoomStep,
    minZoom,
    maxZoom,
    scrollStep,
    minScroll,
    maxScroll,
    startTime = 0,
    endTime,
    zeroMarkOffsetX = 0,
    trackHeight,
  }: TimelineProps) {
    this.container = container;

    this._startTime = startTime;
    this._endTime = endTime;

    this.zoomController = new ZoomController(zoomStep, minZoom, maxZoom);

    this.hScrollController = new ScrollController(
      scrollStep,
      minScroll,
      maxScroll ?? 0,
    );

    this._zeroMarkOffsetX = zeroMarkOffsetX;

    if (trackHeight) {
      this.trackHeight = trackHeight;
    }

    this._hPixelsPerSecond = getPixelPerSeconds(minZoom);

    makeAutoObservable(this, {
      scrollWidth: computed,
      boundingClientRect: computed,
      clientWidth: computed,
      clientHeight: computed,
      hScroll: computed,
      dpi: computed,
      zoom: computed,
      hPixelsPerSecond: computed,
      startTime: computed,
      endTime: computed,
      viewportBounds: computed,
      viewportBoundsWithBuffer: computed,
    });
  }

  //#region Mappings

  /**
   * @description Map pixels from timeline view to global coordinates
   * @param x global coordinate in pixels
   * @returns local coordinate in pixels
   */
  globalToLocal = (x: number): number => {
    return x - this.hScroll;
  };

  /**
   * @description Map pixels from global coordinates to timeline view
   * @param x local coordinate in pixels
   * @returns global coordinate in pixels
   */
  localToGlobal = (x: number): number => {
    return x + this.hScroll;
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

    x -= this.zeroMarkOffsetX;

    x += this.hScroll;

    x /= this.hPixelsPerSecond;

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

    x -= this.zeroMarkOffsetX;

    x /= this.hPixelsPerSecond;

    return x;
  };

  /**
   *
   * @param time time in seconds
   * @returns x coordinate in pixels relative to the timeline container view with scroll
   */
  timeToGlobal = (time: number): number => {
    return time * this.hPixelsPerSecond + this.zeroMarkOffsetX;
  };

  /**
   *
   * @param time time in seconds
   * @returns x coordinate in pixels relative to the timeline container without scroll
   */
  timeToLocal = (time: number): number => {
    return time * this.hPixelsPerSecond + this.zeroMarkOffsetX - this.hScroll;
  };

  /**
   * @description Convert time to pixels
   * @param time time in seconds
   * @returns pixels
   */
  timeToPixels = (time: number): number => {
    return time * this.hPixelsPerSecond;
  };

  /**
   * @description Convert pixels to time
   * @param x pixels
   * @returns time in seconds
   */
  pixelsToTime = (x: number): number => {
    return x / this.hPixelsPerSecond;
  };

  //#endregion

  setViewBoundsInPixels = (startX: number, endX: number): void => {
    runInAction(() => {
      const startTime = clamp(this.localToTime(startX, false), 0);
      const newZoom = clamp(this._getNewZoomToReachBounds(startX, endX), 0.1);

      if (!isNaN(newZoom)) {
        this.zoom = newZoom;
      }

      this.hScroll = this.timeToPixels(startTime);
    });
  };

  private _getNewZoomToReachBounds = (start: number, end: number) => {
    const distance = end - start;
    const zoomDifference = this.clientWidth / distance;

    if (zoomDifference < this.zoomController.step) {
      return this.zoom * zoomDifference;
    }

    return (
      this.zoom *
      Math.floor(zoomDifference / this.zoomController.step) *
      this.zoomController.step
    );
  };

  //#region Listeners

  // Use only on client side
  setupObservers = () => {
    this._setupHScrollObserver();
    this._setupZoomObserver();
    this._setupResizeObserver();
    this._setupDpiObserver();
  };

  // Use only on client side
  cleanupObservers = () => {
    this._setupZoomObserver(true);
    this._setupHScrollObserver(true);
    this._setupResizeObserver(true);
    this._setupDpiObserver(true);
  };

  private _setupHScrollObserver = (onlyCleanup: boolean = false) => {
    this.hScrollController.removeListener(this._hScrollCallback);

    if (onlyCleanup) {
      return;
    }

    this._hScrollCallback(this.hScroll);

    this.hScrollController.addListener(this._hScrollCallback);
  };

  private _setupZoomObserver = (onlyCleanup: boolean = false) => {
    this.zoomController.removeListener(this._zoomCallback);

    if (onlyCleanup) {
      return;
    }

    this._zoomCallback(this._zoom);

    this.zoomController.addListener(this._zoomCallback);
  };

  private _setupResizeObserver = (onlyCleanup: boolean = false) => {
    this._resizeObserver?.disconnect();

    if (onlyCleanup) {
      return;
    }

    if (this._resizeObserver === null) {
      this._resizeObserver = new ResizeObserver(this._resizeCallback);
    }

    if (this._container === null) {
      return;
    }

    this._boundingClientRect = this._container?.getBoundingClientRect();
    this._resizeObserver.observe(this._container);
  };

  private _setupDpiObserver = (onlyCleanup: boolean = false) => {
    if (typeof window === 'undefined') {
      throw new Error("DPI observer can't be used in SSR");
    }

    window.removeEventListener('resize', this._dpiCallback);

    if (onlyCleanup) {
      return;
    }

    this._dpiCallback();

    window.addEventListener('resize', this._dpiCallback);
  };

  private _hScrollCallback = (scroll: number) => {
    runInAction(() => {
      this._interactedBefore = true;
      this._hScroll = scroll;
    });
  };

  private _zoomCallback = (zoom: number) => {
    runInAction(() => {
      this._interactedBefore = true;
      this._zoom = zoom;
      this._hPixelsPerSecond = getPixelPerSeconds(zoom);

      this._updateScrollControllerBounds();
    });
  };

  private _resizeCallback: ResizeObserverCallback = () => {
    runInAction(() => {
      if (this._container === null) {
        return;
      }

      this._boundingClientRect = this._container.getBoundingClientRect();
    });
  };

  private _dpiCallback = () => {
    runInAction(() => {
      this._dpi = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
    });
  };

  //#endregion

  private _updateScrollControllerBounds = () => {
    this.hScrollController.min = this.timeToPixels(this._startTime);
    this.hScrollController.max =
      this.hScrollController.min + this.scrollWidth - this.clientWidth;
  };
}
