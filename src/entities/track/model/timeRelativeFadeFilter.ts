'use client';

import { makeAutoObservable } from 'mobx';

import { FadeFilter, FadeFilterProps } from './fadeFilter';

export interface TimeRelativeFadeFilterProps extends FadeFilterProps {
  mediaElement: HTMLMediaElement;
  audioContext: AudioContext;
}

export class TimeRelativeFadeFilter {
  readonly fadeFilter: FadeFilter;
  private _audioContext: AudioContext;
  private _mediaElement: HTMLMediaElement;

  constructor({
    audioContext,
    mediaElement,
    type,
    gainNode,
  }: TimeRelativeFadeFilterProps) {
    this.fadeFilter = new FadeFilter({ gainNode, type });

    this._audioContext = audioContext;
    this._mediaElement = mediaElement;

    makeAutoObservable(this);
  }

  linearFadeOut = (start: number, duration: number) => {
    const timeDiff =
      this._audioContext.currentTime - this._mediaElement.currentTime;

    const relativeStart = (timeDiff < 0 ? 0 : timeDiff) + start;

    this.fadeFilter.linearFadeOut(relativeStart, duration);
  };
}
