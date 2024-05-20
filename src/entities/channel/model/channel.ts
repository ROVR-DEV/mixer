import { ObservableSet, makeAutoObservable, observable } from 'mobx';
// eslint-disable-next-line import/named
import { v4 } from 'uuid';

// eslint-disable-next-line boundaries/element-types
import { Track, TrackWithMeta } from '@/entities/track';

export class Channel {
  id: string;
  isMuted: boolean = false;
  isSolo: boolean = false;

  tracks: ObservableSet<TrackWithMeta> = observable.set();

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
    this.tracks.add(new TrackWithMeta(track, this.id));
  };

  addTrack = (track: TrackWithMeta) => {
    this.tracks.add(track);
  };

  removeTrack = (track: TrackWithMeta) => {
    this.tracks.delete(track);
  };

  clearTracks = () => {
    this.tracks.clear();
  };
}
