import { IObservableArray, makeAutoObservable, observable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';

import {
  TRACK_COLORS,
  trackColorsGenerator,
  // eslint-disable-next-line boundaries/element-types
} from '@/entities/audio-editor';
// eslint-disable-next-line boundaries/element-types
import { Track, TrackWithMeta } from '@/entities/track';

export type ChannelProps = {
  id?: string;
  color?: string;
} | void;

export class Channel {
  id: string;
  isMuted: boolean = false;
  isSolo: boolean = false;

  private _colorsGenerator = trackColorsGenerator(TRACK_COLORS);

  tracks: IObservableArray<TrackWithMeta> = observable.array();

  constructor(id: string = v4()) {
    this.id = id;

    makeAutoObservable(this);
  }

  setMuted = (value: boolean) => {
    this.isMuted = value;
  };

  toggleMute = () => {
    this.isMuted = !this.isMuted;
  };

  setSolo = (value: boolean) => {
    this.isSolo = value;
  };

  toggleSolo = () => {
    this.isSolo = !this.isSolo;
  };

  importTrack = (track: Track) => {
    const trackWithMeta = new TrackWithMeta(track, this);
    trackWithMeta.color = this._colorsGenerator.next().value;
    this.tracks.push(trackWithMeta);
    return trackWithMeta;
  };

  addTrack = (track: TrackWithMeta) => {
    track.channel = this;
    this.tracks.push(track);
  };

  removeTrack = (track: TrackWithMeta) => {
    return this.tracks.remove(track);
  };

  clearTracks = (onDestroy?: (track: TrackWithMeta) => void) => {
    this.tracks.forEach((track) => {
      track.audioBuffer?.destroy();
      onDestroy?.(track);
    });
    this.tracks.clear();
  };
}
