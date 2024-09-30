export interface AudioPlayer {
  play: (time: number) => void;
  pause: () => void;
  stop: () => void;

  isPlaying(): boolean;

  getDuration: () => number;

  getCurrentTime: () => number;
  setTime: (time: number) => void;

  getAudioBuffer: () => AudioBuffer | null;

  setVolume: (volume: number) => void;
  getVolume: () => number;

  load(audioBuffer: AudioBuffer): void;
}

export class AudioBufferPlayer implements AudioPlayer {
  private audioContext: AudioContext;
  private bufferSource: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private gainNode: GainNode;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private timeUpdateInterval: number | null = null;
  private canPlayCallback: (() => void) | null = null;
  private timeUpdateCallback: (() => void) | null = null;
  private _isPlaying: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  load = async (audioBuffer: AudioBuffer): Promise<void> => {
    this.audioBuffer = audioBuffer;
    this.fireCanPlay();
  };

  setTime = (time: number) => {
    this.pauseTime = time;

    if (time && this.isPlaying()) {
      this.play(time);
    }
  };

  play = (time: number = 0) => {
    if (!this.audioBuffer) {
      return;
    }

    // Очищаем старый источник
    if (this.bufferSource) {
      this.bufferSource.disconnect();
    }

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.connect(this.gainNode);

    const offset = time || this.pauseTime || 0;
    if (offset < 0) {
      return;
    }

    this._isPlaying = true;

    this.bufferSource.start(0, offset);

    this.startTime = this.audioContext.currentTime - offset;
    this.bufferSource.onended = this.onEnd;
    this.startTimeUpdate();
  };

  pause = () => {
    if (!this.bufferSource) {
      return;
    }

    // if (this._isPlaying) {
    //   this._isPlaying = false;
    // }

    this.bufferSource.stop();
  };

  stop = () => {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource = null;
      this.pauseTime = 0;
      this._isPlaying = false;
      this.stopTimeUpdate();
    }
  };

  isPlaying = () => {
    return this._isPlaying;
  };

  getAudioBuffer() {
    return this.audioBuffer;
  }

  getDuration = (): number => {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  };

  getCurrentTime = (): number => {
    if (this.bufferSource) {
      return this.audioContext.currentTime - this.startTime;
    }
    return this.pauseTime;
  };

  setVolume = (volume: number) => {
    this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  };

  getVolume = (): number => {
    return this.gainNode.gain.value;
  };

  private fireCanPlay() {
    if (this.canPlayCallback) {
      this.canPlayCallback();
    }
  }

  private startTimeUpdate() {
    if (this.timeUpdateInterval === null) {
      this.timeUpdateInterval = window.setInterval(() => {
        if (this.timeUpdateCallback) {
          this.timeUpdateCallback();
        }
      }, 100); // Call every 100ms to simulate `timeupdate`
    }
  }

  private stopTimeUpdate() {
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  private onEnd = () => {
    this.bufferSource = null;
    this._isPlaying = false;
    this.pauseTime = 0;
    this.stopTimeUpdate();
  };

  canplay(callback: () => void) {
    this.canPlayCallback = callback;
  }
  removeCanplay() {
    this.canPlayCallback = null;
  }
  timeupdate(callback: () => void) {
    this.timeUpdateCallback = callback;
  }
  removeTimeupdate() {
    this.timeUpdateCallback = null;
  }
}
