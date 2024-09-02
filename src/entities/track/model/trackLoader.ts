import {
  ObservableMap,
  computed,
  makeAutoObservable,
  observable,
  values,
} from 'mobx';

import { arrayBufferToBlob, FetchResult } from '@/shared/lib';

import { Track } from './track';
import { TrackData } from './trackData';

export type TrackLoadedFunction = (trackData: TrackData) => void;

export interface TrackLoaderState {
  tracksData: Map<string, TrackData>;
}

export interface TrackLoader {
  readonly tracksData: Map<string, TrackData>;

  readonly loadedTracksCount: number;

  downloadTracks: (
    tracks: Track[],
    onLoaded?: TrackLoadedFunction,
  ) => Promise<void>;
  downloadTrack: (uuid: Track, onLoaded?: TrackLoadedFunction) => Promise<void>;

  clearData: () => void;

  getState(): TrackLoaderState;
  restoreState(state: TrackLoaderState): void;
}

const getLoadTrackWorker = (): Worker =>
  new Worker(new URL('./loadTrackWorker', import.meta.url));

const loadTrackThroughWorker = (trackUuid: string) =>
  new Promise<Omit<FetchResult<ArrayBuffer | null>, 'response'>>(
    (resolve, reject) => {
      const worker = getLoadTrackWorker();

      worker.onmessage = async ({
        data,
      }: MessageEvent<Omit<FetchResult<ArrayBuffer | null>, 'response'>>) => {
        resolve(data);
        worker.terminate();
      };

      worker.onerror = async (error: ErrorEvent) => {
        reject(error.error);
      };

      worker.postMessage({ uuid: trackUuid, cache: true });
    },
  );

const ATTEMPTS_COUNT = 5;

const MAX_SIMULTANEOUS_REQUESTS = 4;

export class ObserverTrackLoader implements TrackLoader {
  readonly tracksData: ObservableMap<string, TrackData> = observable.map();

  get loadedTracksCount() {
    return values(this.tracksData).reduce(
      (count, track) => count + Number(track.status === 'fulfilled'),
      0,
    );
  }

  constructor() {
    makeAutoObservable(this, {
      loadedTracksCount: computed,
    });
  }

  downloadTracks = async (
    tracks: Track[],
    onLoaded?: TrackLoadedFunction,
  ): Promise<void> => {
    tracks.forEach((track) => this._ensureTrackDataExists(track));

    const requests = tracks
      .slice(0, MAX_SIMULTANEOUS_REQUESTS)
      .map((track) => this.downloadTrack(track, onLoaded));

    let current_track_index = MAX_SIMULTANEOUS_REQUESTS;
    requests.forEach(async (request) => {
      await request;

      while (current_track_index < tracks.length) {
        await this.downloadTrack(tracks[current_track_index], onLoaded);
        current_track_index++;
      }
    });
  };

  downloadTrack = async (
    track: Track,
    onLoaded?: TrackLoadedFunction,
    force: boolean = false,
  ): Promise<void> => {
    const trackData = this._ensureTrackDataExists(track);

    if (!force && trackData.status !== 'empty') {
      return;
    }

    trackData.status = 'loading';

    const onDataLoaded = async (data: ArrayBuffer | null) => {
      if (!data) {
        return;
      }

      trackData.setData(arrayBufferToBlob(data));

      onLoaded?.(trackData);
    };

    let attempt = 0;
    while (attempt < ATTEMPTS_COUNT) {
      try {
        const res = await loadTrackThroughWorker(track.uuid);

        if (res.data) {
          onDataLoaded(res.data);
          break;
        }
      } catch {
        /* empty */
      } finally {
        attempt++;
      }
    }
  };

  clearData = (): void => {
    this.tracksData.clear();
  };

  getState = (): TrackLoaderState => {
    return {
      tracksData: this.tracksData,
    };
  };

  restoreState = (state: TrackLoaderState): void => {
    this.tracksData.replace(state.tracksData);
  };

  private _ensureTrackDataExists = (track: Track): TrackData => {
    if (this.tracksData.has(track.uuid)) {
      return this.tracksData.get(track.uuid)!;
    }

    this.tracksData.set(track.uuid, new TrackData(track.uuid));
    return this.tracksData.get(track.uuid)!;
  };
}
