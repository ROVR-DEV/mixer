import { ObservableMap, makeAutoObservable, observable, values } from 'mobx';

import { getTrack } from '../api';
import { isTrackCachingEnabled } from '../lib';

import { Track } from './track';
import { TrackData } from './trackData';

export class TracksManager {
  tracks: Track[];
  tracksData: ObservableMap<string, TrackData> = observable.map();

  constructor(tracks: Track[]) {
    this.tracks = tracks;
    this.tracks.forEach((track) =>
      this.tracksData.set(track.uuid, new TrackData(track.uuid)),
    );

    makeAutoObservable(this);
  }

  get loadedTracksCount() {
    return values(this.tracksData).reduce(
      (count, track) => count + Number(track.status === 'fulfilled'),
      0,
    );
  }

  downloadTracks = async (onLoad?: (trackData: TrackData) => void) => {
    this.tracks.forEach((track) => {
      const trackData = this.tracksData.get(track.uuid);

      if (!trackData || trackData.status !== 'empty') {
        return;
      }

      trackData.status = 'loading';

      getTrack(track.uuid, isTrackCachingEnabled()).then((res) => {
        if (!res.data) {
          return;
        }

        trackData.setData(res.data);
        onLoad?.(trackData);
      });
    });
  };
}
