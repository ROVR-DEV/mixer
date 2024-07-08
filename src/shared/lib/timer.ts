type TimerCallback = (time: number) => void;

export type TimerStatus = 'started' | 'paused' | 'stopped';

export class Timer {
  private startTimestamp: number = 0;
  private currentTime: number = 0;

  private requestId: number | null = null;

  private status: TimerStatus = 'stopped';

  private callback: TimerCallback;

  constructor(callback: TimerCallback) {
    this.callback = callback;
  }

  start = () => {
    if (this.status === 'started') {
      return;
    }

    this.status = 'started';
    this._startLoop();
  };

  stop = () => {
    if (this.status === 'stopped') {
      return;
    }

    this.status = 'stopped';
    this._stopLoop();
    this.currentTime = 0;
  };

  pause() {
    if (this.status === 'paused') {
      return;
    }

    this.status = 'paused';
    this._stopLoop();
  }

  setTime = (time: number) => {
    this.currentTime = time;
    this.startTimestamp = 0;
  };

  private _startLoop = () => {
    this.requestId = requestAnimationFrame(this._tick);
  };

  private _stopLoop = () => {
    if (this.requestId !== null) {
      cancelAnimationFrame(this.requestId);
    }
    this.requestId = null;
    this.startTimestamp = 0;
  };

  private _tick = (timestamp: number) => {
    if (this.status !== 'started') {
      this.stop();
    }

    const delta = timestamp - (this.startTimestamp || timestamp);
    this.currentTime += delta;

    this.callback(this.currentTime);

    this.startTimestamp = timestamp;
    this._startLoop();
  };
}
