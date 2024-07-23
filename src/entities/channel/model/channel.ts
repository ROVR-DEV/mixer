import { IObservableArray, makeAutoObservable, observable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';

import {
  trackColorsGenerator,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';
// eslint-disable-next-line boundaries/element-types
import { Track, AudioEditorTrack } from '@/entities/track';

type TrackColorsGenerator = ReturnType<typeof trackColorsGenerator>;

export interface AudioEditorChannelState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
}

export class Channel {
  id: string;
  isMuted: boolean = false;
  isSolo: boolean = false;

  readonly tracks: IObservableArray<AudioEditorTrack> = observable.array();

  private _colorsGenerator: TrackColorsGenerator | null = null;

  get colorsGenerator(): TrackColorsGenerator | null {
    return this._colorsGenerator;
  }
  set colorsGenerator(value: TrackColorsGenerator) {
    this._colorsGenerator = value;
  }

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
    const audioEditorTrack = new AudioEditorTrack(track, this);

    if (this._colorsGenerator) {
      audioEditorTrack.color = this._colorsGenerator.next().value;
    }

    this.tracks.push(audioEditorTrack);
    return audioEditorTrack;
  };

  addTrack = (track: AudioEditorTrack) => {
    track.channel = this;
    this.tracks.push(track);
    this.tracks.sort((a, b) => a.startTime - b.startTime);
  };

  removeTrack = (track: AudioEditorTrack) => {
    return this.tracks.remove(track);
  };

  clearTracks = () => {
    this.tracks.clear();

    if (this._colorsGenerator) {
      this._colorsGenerator.next({ reset: true });
    }
  };

  dispose = () => {
    this.tracks.forEach((track) => track.dispose());
    this.clearTracks();
  };

  getState = (): AudioEditorChannelState => {
    return {
      id: this.id,
      isMuted: this.isMuted,
      isSolo: this.isSolo,
    };
  };

  restoreState = (state: AudioEditorChannelState) => {
    this.id = state.id;
    this.isMuted = state.isMuted;
    this.isSolo = state.isSolo;
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
