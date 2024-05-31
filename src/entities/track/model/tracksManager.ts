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

  downloadTracks = async () => {
    this.tracks.forEach((track) => {
      const trackData = this.tracksData.get(track.uuid);

      if (
        !trackData ||
        trackData.status === 'loading' ||
        trackData.status === 'fulfilled'
      ) {
        return;
      }

      trackData.status = 'loading';

      getTrack(track.uuid, isTrackCachingEnabled()).then((res) =>
        this._onSuccessDownload(track.uuid, res.data),
      );
    });
  };

  private _onSuccessDownload = (trackUuid: string, data: Blob | undefined) => {
    const trackData = this.tracksData.get(trackUuid);
    if (!trackData || !data) {
      return;
    }

    trackData.status = 'fulfilled';
    trackData.blob = data;
  };
}
