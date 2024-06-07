import { makeAutoObservable } from 'mobx';

export class TrackAudioFilters {
  audioContext: AudioContext = new AudioContext();
  mediaElement: HTMLMediaElement;
  mediaSourceNode?: MediaElementAudioSourceNode;

  fadeInNode: GainNode = this.audioContext.createGain();
  fadeOutNode: GainNode = this.audioContext.createGain();

  private _prevFadeInStartTime: number = 0;
  private _prevFadeInEndTime: number = 0;

  private _prevFadeOutStartTime: number = 0;
  private _prevFadeOutEndTime: number = 0;

  private _fadeInStartTime: number = 0;
  private _fadeInEndTime: number = 0;

  private _fadeOutStartTime: number = 0;
  private _fadeOutEndTime: number = 0;

  get fadeInStartTime(): number {
    return this._fadeInStartTime;
  }
  set fadeInStartTime(fadeInStartTime: number) {
    this._setFadeInStartTime(fadeInStartTime);
  }

  get fadeInEndTime(): number {
    return this._fadeInEndTime;
  }
  set fadeInEndTime(fadeInEndTime: number) {
    this._setFadeInEndTime(fadeInEndTime);
  }

  get fadeOutStartTime(): number {
    return this._fadeOutStartTime;
  }
  set fadeOutStartTime(fadeOutStartTime: number) {
    this._setFadeOutStartTime(fadeOutStartTime);
  }

  get fadeOutEndTime(): number {
    return this._fadeOutEndTime;
  }
  set fadeOutEndTime(fadeOutEndTime: number) {
    this._setFadeOutEndTime(fadeOutEndTime);
  }

  constructor(mediaElement: HTMLMediaElement) {
    this._fadeOutStartTime = mediaElement.duration;
    this._fadeOutEndTime = mediaElement.duration;

    this.fadeInNode.gain.setValueAtTime(1, this._fadeInStartTime);
    this.fadeOutNode.gain.setValueAtTime(1, this._fadeOutEndTime);

    this.mediaElement = mediaElement;
    this.mediaElement.addEventListener(
      'canplaythrough',
      () => {
        this.mediaSourceNode = this.audioContext.createMediaElementSource(
          this.mediaElement,
        );

        this.audioContext.resume();

        this.fadeInNode.connect(this.audioContext.destination);
        this.fadeOutNode.connect(this.audioContext.destination);

        this.mediaSourceNode.connect(this.fadeInNode);
        this.mediaSourceNode.connect(this.fadeOutNode);
      },
      {
        once: true,
      },
    );

    makeAutoObservable(this);
  }

  private _updateFadeIn = () => {
    this.fadeInNode.gain.cancelScheduledValues(this._prevFadeInStartTime);
    this.fadeInNode.gain.cancelScheduledValues(this._prevFadeInEndTime);

    this.fadeInNode.gain.linearRampToValueAtTime(0, this._fadeInStartTime);
    this.fadeInNode.gain.linearRampToValueAtTime(1, this._fadeInEndTime);
  };

  private _updateFadeOut = () => {
    this.fadeOutNode.gain.cancelScheduledValues(this._prevFadeOutStartTime);
    this.fadeOutNode.gain.cancelScheduledValues(this._prevFadeOutEndTime);

    this.fadeOutNode.gain.linearRampToValueAtTime(1, this._fadeOutStartTime);
    this.fadeOutNode.gain.linearRampToValueAtTime(0, this._fadeOutEndTime);
  };

  private _setFadeInStartTime = (fadeInStartTime: number) => {
    this._prevFadeInStartTime = this._fadeInStartTime;
    this._fadeInStartTime = fadeInStartTime;

    this._updateFadeIn();
  };

  private _setFadeInEndTime = (fadeInEndTime: number) => {
    this._prevFadeInEndTime = this._fadeInEndTime;
    this._fadeInEndTime = fadeInEndTime;

    this._updateFadeIn();
  };

  private _setFadeOutStartTime = (fadeOutStartTime: number) => {
    this._prevFadeOutStartTime = this._fadeOutStartTime;
    this._fadeOutStartTime = fadeOutStartTime;

    this._updateFadeOut();
  };

  private _setFadeOutEndTime = (fadeOutEndTime: number) => {
    this._prevFadeOutEndTime = this._fadeOutEndTime;
    this._fadeOutEndTime = fadeOutEndTime;

    this._updateFadeOut();
  };
}
