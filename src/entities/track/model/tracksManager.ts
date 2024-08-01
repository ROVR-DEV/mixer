import { ObservableMap, makeAutoObservable, observable, values } from 'mobx';

import { arrayBufferToBlob } from '@/shared/lib';

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

  downloadTracks = (onLoad?: (trackData: TrackData) => void) => {
    this.tracks.forEach(async (track) => {
      const trackData = this.tracksData.get(track.uuid);

      if (!trackData || trackData.status !== 'empty') {
        return;
      }

      trackData.status = 'loading';

      const worker = new Worker(new URL('./loadTrackWorker', import.meta.url));

      worker.onmessage = async ({ data }: MessageEvent<ArrayBuffer | null>) => {
        if (!data) {
          return;
        }

        const blob = arrayBufferToBlob(data);

        trackData.setData(blob);
        onLoad?.(trackData);

        worker.terminate();
      };

      worker.postMessage({ uuid: track.uuid, cache: isTrackCachingEnabled() });
    });
  };
}
