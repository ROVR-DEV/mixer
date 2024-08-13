import { makeAutoObservable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';

// eslint-disable-next-line boundaries/element-types
import { adjustTracksOnPaste } from '@/features/track-card-view';

import { AudioFilters } from './audioFilters';
import { TrackDnDInfo } from './dndInfo';
import { Track } from './track';

export interface AudioEditorTrackState {
  uuid: string;
  channelId: string;

  startTime: number;
  endTime: number;

  startTrimDuration: number;
  endTrimDuration: number;

  meta: Track;

  audioPeaks: Array<Float32Array | number[]> | null;
  isPeaksReady: boolean;

  src: HTMLMediaElement['src'];

  color: string | null;

  filters: {
    fadeIn: {
      startTime: number;
      endTime: number;
    };
    fadeOut: {
      startTime: number;
      endTime: number;
    };
  };
}

export class AudioEditorTrack {
  readonly id: string = v4();

  readonly dndInfo: TrackDnDInfo = new TrackDnDInfo();
  readonly mediaElement: HTMLMediaElement = new Audio();

  audioPeaks: Array<Float32Array | number[]> | null = [];

  startTime: number;
  endTime: number;
  startTrimDuration: number = 0;
  endTrimDuration: number = 0;

  private _isPeaksReady: boolean = false;
  private _meta: Track;
  private _channel: Channel;
  private _audioBuffer: WaveSurfer | null = null;
  private _filters: AudioFilters = new AudioFilters();
  private _color: string | null = null;
  private _isTrimming: boolean = false;

  get isPeaksReady(): boolean {
    return this._isPeaksReady;
  }

  get meta() {
    return this._meta;
  }
  private set meta(value: Track) {
    this._meta = value;
  }

  get channel(): Channel {
    return this._channel;
  }
  set channel(value: Channel) {
    this._channel = value;
  }

  get audioBuffer(): WaveSurfer | null {
    return this._audioBuffer;
  }

  get filters(): AudioFilters {
    return this._filters;
  }

  get color(): string | null {
    return this._color;
  }
  set color(value: string | null) {
    this._color = value;
  }

  get isTrimming() {
    return this._isTrimming;
  }
  set isTrimming(value: boolean) {
    this._isTrimming = value;
  }

  get trimStartTime(): number {
    return this.startTime + this.startTrimDuration;
  }

  get trimEndTime(): number {
    return this.endTime - this.endTrimDuration;
  }

  get duration(): number {
    return this.meta.end - this.meta.start;
  }

  get trimDuration(): number {
    return this.trimEndTime - this.trimStartTime;
  }

  constructor(track: Track, channel: Channel) {
    this._meta = track;

    this._channel = channel;

    this.startTime = track.start;
    this.endTime = track.end;

    this._updateAudioFiltersBounds();
    this._filters.fadeInNode.linearFadeInDuration(0);
    this._filters.fadeOutNode.linearFadeOutDuration(0);

    makeAutoObservable(this);
  }

  setAudioBuffer = (audioBuffer: WaveSurfer) => {
    if (this._audioBuffer === audioBuffer) {
      return;
    }

    this._audioBuffer = audioBuffer;
    this._filters.audioBuffer = audioBuffer;
  };

  load = (src: HTMLMediaElement['src']) => {
    this.mediaElement.src = src;
  };

  setPeaks = (peaks: typeof this.audioPeaks) => {
    this.audioPeaks = peaks;
    this._isPeaksReady = true;
  };

  setStartTime = (time: number) => {
    this.startTime = time - this.startTrimDuration;
    this.endTime = this.startTime + this.duration;
  };

  setStartTrimDuration(duration: number) {
    this.startTrimDuration = duration;
    this._updateAudioFiltersBounds();
  }

  setEndTrimDuration(duration: number) {
    this.endTrimDuration = duration;
    this._updateAudioFiltersBounds();
  }

  setTitleAndArtist = (
    title: string | undefined,
    artist: string | undefined,
  ) => {
    const trimmedTitle = title?.trim();
    if (trimmedTitle) {
      this.meta.title = trimmedTitle;
    }

    const trimmedArtist = artist?.trim();
    if (trimmedArtist) {
      this.meta.artist = trimmedArtist;
    }
  };

  split = (time: number) => {
    const trackCopy = this.clone();

    trackCopy.setStartTrimDuration(time - trackCopy.startTime);
    trackCopy.setEndTrimDuration(this.endTrimDuration);
    trackCopy.setStartTime(time);

    trackCopy.filters.fadeOutNode.linearFadeOut(
      this.filters.fadeOutNode.startTime,
      this.filters.fadeOutNode.duration,
    );

    this.filters.fadeOutNode.linearFadeOut(
      this.duration - this.endTrimDuration,
      0,
    );

    this.setEndTrimDuration(this.endTime - time);

    this.channel.addTrack(trackCopy);

    adjustTracksOnPaste(this);
    adjustTracksOnPaste(trackCopy);

    return trackCopy;
  };

  clone = () => {
    const clonedTrack = new AudioEditorTrack(this.meta, this.channel);
    clonedTrack.color = this.color;
    clonedTrack.load(this.mediaElement.src);
    clonedTrack.audioPeaks = this.audioPeaks;
    clonedTrack.setStartTime(this.startTime);
    clonedTrack._isPeaksReady = this._isPeaksReady;

    return clonedTrack;
  };

  dispose = () => {
    this.audioBuffer?.stop();
    this.audioBuffer?.destroy();
  };

  //#region State
  getState = (): AudioEditorTrackState => {
    return {
      uuid: this.id,
      channelId: this.channel.id,
      startTime: this.startTime,
      endTime: this.endTime,
      startTrimDuration: this.startTrimDuration,
      endTrimDuration: this.endTrimDuration,
      src: this.mediaElement.src,
      color: this.color,
      meta: this.meta,
      isPeaksReady: this._isPeaksReady,
      audioPeaks: this.audioPeaks,
      filters: {
        fadeIn: {
          startTime: this.filters.fadeInNode.startTime,
          endTime: this.filters.fadeInNode.endTime,
        },
        fadeOut: {
          startTime: this.filters.fadeOutNode.startTime,
          endTime: this.filters.fadeOutNode.endTime,
        },
      },
    } satisfies AudioEditorTrackState;
  };

  restoreState = (state: AudioEditorTrackState) => {
    this.startTime = state.startTime;
    this.endTime = state.endTime;
    this.startTrimDuration = state.startTrimDuration;
    this.endTrimDuration = state.endTrimDuration;

    this.meta = state.meta;
    if (!this.mediaElement.src) {
      this.load(state.src);
    }
    this.color = state.color;

    if (state.isPeaksReady) {
      this.audioPeaks = state.audioPeaks;
    }

    this.filters.fadeInNode.linearFadeIn(
      state.filters.fadeIn.startTime,
      state.filters.fadeIn.endTime,
    );
    this.filters.fadeOutNode.linearFadeOut(
      state.filters.fadeOut.startTime,
      state.filters.fadeOut.endTime,
    );
  };
  //#endregion

  private _updateAudioFiltersBounds = () => {
    if (!this.filters) {
      return;
    }

    const fadeInDuration = this.filters.fadeInDuration;
    const fadeOutDuration = this.filters.fadeOutDuration;

    this.filters.fadeInNode.setBounds(
      this.startTrimDuration,
      this.duration - this.endTrimDuration,
    );
    this.filters.fadeOutNode.setBounds(
      this.startTrimDuration,
      this.duration - this.endTrimDuration,
    );

    this.filters.setFadeInEndTime(
      this.filters.fadeInNode.minTime + fadeInDuration,
    );
    this.filters.setFadeOutStartTime(
      this.filters.fadeOutNode.maxTime - fadeOutDuration,
    );
  };
}
