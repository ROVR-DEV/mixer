import { IObservableArray, makeAutoObservable, observable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';

import {
  trackColorsGenerator,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';
// eslint-disable-next-line boundaries/element-types
import { Track, AudioEditorTrack } from '@/entities/track';

export type ChannelProps = {
  id?: string;
  color?: string;
} | void;

type TrackColorsGenerator = ReturnType<typeof trackColorsGenerator>;

export class Channel {
  id: string;
  isMuted: boolean = false;
  isSolo: boolean = false;

  private _colorsGenerator: TrackColorsGenerator | null = null;

  get colorsGenerator(): TrackColorsGenerator | null {
    return this._colorsGenerator;
  }

  set colorsGenerator(value: TrackColorsGenerator) {
    this._colorsGenerator = value;
  }

  readonly tracks: IObservableArray<AudioEditorTrack> = observable.array();

  constructor(id: string = v4()) {
    this.id = id;

    makeAutoObservable(this);
  }

  setMuted = (value: boolean) => {
    this.isMuted = value;
    this._updateSolo();
  };

  toggleMute = () => {
    this.isMuted = !this.isMuted;
    this._updateSolo();
  };

  setSolo = (value: boolean) => {
    this.isSolo = value;
    this._updateMuted();
  };

  toggleSolo = () => {
    this.isSolo = !this.isSolo;
    this._updateMuted();
  };

  importTrack = (track: Track) => {
    const trackWithMeta = new AudioEditorTrack(track, this);

    if (this._colorsGenerator) {
      trackWithMeta.color = this._colorsGenerator.next().value;
    }

    this.tracks.push(trackWithMeta);
    return trackWithMeta;
  };

  addTrack = (track: AudioEditorTrack) => {
    track.channel = this;
    this.tracks.push(track);
  };

  removeTrack = (track: AudioEditorTrack) => {
    return this.tracks.remove(track);
  };

  clearTracks = (onDestroy?: (track: AudioEditorTrack) => void) => {
    this.tracks.forEach((track) => {
      track.audioBuffer?.destroy();
      onDestroy?.(track);
    });
    this.tracks.clear();

    if (this._colorsGenerator) {
      this._colorsGenerator.next({ reset: true });
    }
  };

  private _updateMuted = () => {
    if (this.isSolo && this.isMuted) {
      this.isMuted = false;
    }
  };

  private _updateSolo = () => {
    if (this.isMuted && this.isSolo) {
      this.isSolo = false;
    }
  };
}
