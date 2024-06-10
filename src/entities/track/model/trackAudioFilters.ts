import { makeAutoObservable } from 'mobx';

import { Type } from './fadeFilter';
import { TimeRelativeFadeFilter } from './timeRelativeFadeFilter';

export class TrackAudioFilters {
  audioContext: AudioContext = new AudioContext();
  mediaElement: HTMLMediaElement;
  mediaSourceNode?: MediaElementAudioSourceNode;

  fadeInNode: TimeRelativeFadeFilter;
  fadeOutNode: TimeRelativeFadeFilter;

  constructor(mediaElement: HTMLMediaElement) {
    this.mediaElement = mediaElement;

    this.fadeInNode = new TimeRelativeFadeFilter({
      mediaElement: this.mediaElement,
      audioContext: this.audioContext,
      type: Type.In,
      gainNode: new GainNode(this.audioContext, { gain: 1 }),
    });

    this.fadeOutNode = new TimeRelativeFadeFilter({
      mediaElement: this.mediaElement,
      audioContext: this.audioContext,
      type: Type.Out,
      gainNode: new GainNode(this.audioContext, { gain: 1 }),
    });

    this.mediaElement.addEventListener(
      'canplaythrough',
      () => {
        this.mediaSourceNode = this.audioContext.createMediaElementSource(
          this.mediaElement,
        );
        this.mediaSourceNode.connect(this.fadeInNode.fadeFilter.gainNode);
        this.fadeInNode.fadeFilter.gainNode.connect(
          this.fadeOutNode.fadeFilter.gainNode,
        );
        this.fadeOutNode.fadeFilter.gainNode.connect(
          this.audioContext.destination,
        );

        this.audioContext.resume();
      },
      {
        once: true,
      },
    );

    makeAutoObservable(this);
  }
}
