export interface AudioPlayer {
  play: () => void;
  pause: () => void;
  stop: () => void;

  isPlaying(): boolean;

  getDuration: () => number;

  getCurrentTime: () => number;
  setTime: (time: number) => void;

  setVolume: (volume: number) => void;
  getVolume: () => number;

  load(src: string): void;
}

export class HTMLMediaElementAudioPlayer implements AudioPlayer {
  // Make private
  readonly mediaElement: HTMLMediaElement;

  constructor(player: HTMLMediaElement) {
    this.mediaElement = player;
  }

  play = () => {
    this.mediaElement.play();
  };

  pause = () => {
    this.mediaElement.pause();
  };

  stop = () => {
    this.mediaElement.pause();
    this.mediaElement.currentTime = 0;
  };

  isPlaying = () => {
    return (
      this.mediaElement.currentTime > 0 &&
      !this.mediaElement.ended &&
      !this.mediaElement.paused &&
      this.mediaElement.readyState > 2
    );
  };

  getDuration = (): number => {
    return this.mediaElement.duration;
  };

  getCurrentTime = (): number => {
    return this.mediaElement.currentTime;
  };

  setTime = (value: number) => {
    this.mediaElement.currentTime = value;
  };

  setVolume = (volume: number) => {
    this.mediaElement.volume = volume;
  };

  getVolume = (): number => {
    return this.mediaElement.volume;
  };

  load(src: string): void {
    this.mediaElement.src = src;
  }
}
