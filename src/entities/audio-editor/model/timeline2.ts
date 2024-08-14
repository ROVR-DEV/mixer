import { EventEmitter } from 'eventemitter3';
import { computed, makeAutoObservable, runInAction } from 'mobx';

import { Rect } from '@/shared/model';

import {
  getPixelPerSeconds,
  getTicksForSeconds,
  TimelineTicks,
  // eslint-disable-next-line boundaries/element-types
} from '@/features/timeline';

import { ScrollController } from './scrollController';
import { ZoomController } from './zoomController';

export type Timeline2Events = 'zoom' | 'hScroll' | 'change';

export interface Timeline2 {
  readonly events: EventEmitter<Timeline2Events, Timeline2>;
  readonly zoomController: ZoomController;
  readonly hScrollController: ScrollController;
  //   readonly verticalScrollController: ScrollController;

  timelineElement: HTMLElement | null;

  startTime: number;
  endTime: number;

  hScroll: number;
  // verticalScroll: number;

  zoom: number;
  hPixelsPerSecond: number;

  zeroMarkOffset: number;

  trackHeight: number | null;

  ticks: TimelineTicks;
}

export interface RangeProps {
  min?: number;
  max?: number;
  step: number;
}

export interface ZoomControllerProps extends Required<RangeProps> {}
export interface ScrollControllerProps extends RangeProps {}

export interface Timeline2Props {
  timelineElement?: HTMLElement | null;

  // Timeline bounds
  startTime?: number;
  endTime: number;

  zeroMarkOffsetPx?: number;

  // TODO: maybe should be moved out from timeline
  trackHeight?: number | null;

  // Props for controllers
  zoomControllerProps: ZoomControllerProps;
  hScrollControllerProps: ScrollControllerProps;
}

export class ObservableTimeline implements Timeline2 {
  readonly events = new EventEmitter<Timeline2Events, Timeline2>();
  readonly zoomController: ZoomController;
  readonly hScrollController: ScrollController;

  zeroMarkOffset: number = 0;
  trackHeight: number | null = 98;

  private _timelineElement: HTMLElement | null;
  private _timelineResizeObserver: ResizeObserver;

  private _timelineBoundingRect: Rect = new Rect();

  private _hScroll: number = 0;

  private _zoom: number = 1;
  private _pixelsPerSecond: number = 1;
  private _dpi: number = 1;

  private _startTime: number;
  private _endTime: number;

  get timelineElement(): HTMLElement | null {
    return this._timelineElement;
  }
  set timelineElement(value: HTMLElement | null) {
    this._timelineElement = value;
    this._setupTimelineResizeObserver();
  }

  get boundingRect(): Rect {
    return this._timelineBoundingRect;
  }

  get clientWidth(): number {
    return (this.boundingRect.width || this._timelineElement?.clientWidth) ?? 0;
  }

  get scrollWidth(): number {
    return Math.max(
      this.boundingRect.width,
      this._endTime * this.hPixelsPerSecond,
    );
  }

  get clientHeight(): number {
    return (
      (this.boundingRect.height || this._timelineElement?.clientHeight) ?? 0
    );
  }

  get hScroll(): number {
    return this._hScroll;
  }
  set hScroll(value: number) {
    this.hScrollController.value = value;
  }

  get zoom(): number {
    return this._zoom;
  }
  set zoom(value: number) {
    this.zoomController.value = value;
  }

  get hPixelsPerSecond(): number {
    return this._pixelsPerSecond * this._dpi;
  }

  get startTime(): number {
    return this._startTime;
  }
  set startTime(value: number) {
    this._startTime = value;
    this.hScrollController.min = value;
  }

  get endTime(): number {
    return this._endTime;
  }
  set endTime(value: number) {
    this._endTime = value;
    this.hScrollController.max = value;
  }

  get ticks(): TimelineTicks {
    return getTicksForSeconds(
      this.clientWidth,
      this.zoom,
      this.hScroll * this.hPixelsPerSecond,
    );
  }

  constructor({
    timelineElement = null,
    startTime = 0,
    endTime,
    zeroMarkOffsetPx = 0,
    trackHeight = 0,
    zoomControllerProps,
    hScrollControllerProps,
  }: Timeline2Props) {
    this._timelineElement = timelineElement;

    this._timelineResizeObserver = new ResizeObserver(
      this._timelineSizeListener,
    );

    this._startTime = startTime;
    this._endTime = endTime;

    this.zeroMarkOffset = zeroMarkOffsetPx;

    this.trackHeight = trackHeight;

    const { step: zoomStep, min: minZoom, max: maxZoom } = zoomControllerProps;
    this.zoomController = new ZoomController(zoomStep, minZoom, maxZoom);

    const {
      step: hScrollStep,
      min: minHScroll,
      max: maxHScroll,
    } = hScrollControllerProps;

    this.hScrollController = new ScrollController(
      hScrollStep,
      minHScroll || this.startTime,
      maxHScroll || this.scrollWidth - this.clientWidth,
    );

    makeAutoObservable(this, {
      hScroll: computed,
      zoom: computed,
      hPixelsPerSecond: computed,
      startTime: computed,
      endTime: computed,
    });
  }

  // Use only on client side
  setupObservers = () => {
    this._setupZoomObserver();
    this._setupHScrollObserver();
    this._setupTimelineResizeObserver();
    this._setupDpiObserver();
  };

  cleanupObservers() {
    this._setupZoomObserver(true);
    this._setupHScrollObserver(true);
    this._setupTimelineResizeObserver(true);
    this._setupDpiObserver(true);
  }

  private _setupZoomObserver = (onlyCleanup: boolean = false) => {
    this.zoomController.removeListener(this._zoomControllerListener);

    if (onlyCleanup) {
      return;
    }

    this.zoomController.addListener(this._zoomControllerListener);
  };

  private _setupHScrollObserver = (onlyCleanup: boolean = false) => {
    this.hScrollController.removeListener(this._hScrollControllerListener);

    if (onlyCleanup) {
      return;
    }

    this.hScrollController.addListener(this._hScrollControllerListener);
  };

  private _setupTimelineResizeObserver = (onlyCleanup: boolean = false) => {
    this._timelineResizeObserver.disconnect();

    if (onlyCleanup) {
      return;
    }

    if (this._timelineElement === null) {
      return;
    }

    this._timelineResizeObserver.observe(this._timelineElement);
  };

  private _setupDpiObserver = (onlyCleanup: boolean = false) => {
    if (typeof window === 'undefined') {
      throw new Error("DPI observer can't be used in SSR");
    }

    window.removeEventListener('resize', this._dpiListener);

    if (onlyCleanup) {
      return;
    }

    window.addEventListener('resize', this._dpiListener);
  };

  private _zoomControllerListener = (zoom: number) => {
    runInAction(() => {
      this._zoom = zoom;
      this._pixelsPerSecond = getPixelPerSeconds(zoom);

      this.events.emit('zoom', this);
      this.events.emit('change', this);
    });
  };

  private _hScrollControllerListener = (scroll: number) => {
    runInAction(() => {
      this._hScroll = scroll;

      this.events.emit('hScroll', this);
      this.events.emit('change', this);
    });
  };

  private _timelineSizeListener: ResizeObserverCallback = () => {
    runInAction(() => {
      if (this._timelineElement === null) {
        return;
      }

      this._timelineBoundingRect =
        this._timelineElement.getBoundingClientRect();
      this.events.emit('change', this);
    });
  };

  private _dpiListener = () => {
    runInAction(() => {
      this._dpi = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
      this.events.emit('change', this);
    });
  };
}
