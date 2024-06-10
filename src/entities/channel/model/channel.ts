import { IObservableArray, makeAutoObservable, observable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';

// eslint-disable-next-line boundaries/element-types
import { Track, TrackWithMeta } from '@/entities/track';

export class Channel {
  id: string;
  isMuted: boolean = false;
  isSolo: boolean = false;

  tracks: IObservableArray<TrackWithMeta> = observable.array();

  constructor(id?: string) {
    this.id = id || v4();

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

  clearTracks = () => {
    this.tracks.forEach((track) => track.audioBuffer?.destroy());
    this.tracks.clear();
  };
}
