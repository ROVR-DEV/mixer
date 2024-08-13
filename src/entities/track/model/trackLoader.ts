import {
  ObservableMap,
  computed,
  makeAutoObservable,
  observable,
  values,
} from 'mobx';

import { arrayBufferToBlob } from '@/shared/lib';

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
    await Promise.all(
      tracks.map((track) => this.downloadTrack(track, onLoaded)),
    );
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

    await new Promise((resolve, reject) => {
      const worker = getLoadTrackWorker();

      worker.onmessage = async ({ data }: MessageEvent<ArrayBuffer | null>) => {
        await onDataLoaded(data);
        worker.terminate();
        resolve();
      };

      worker.onerror = async (error: ErrorEvent) => {
        reject(error.error);
      };

      worker.postMessage({ uuid: track.uuid, cache: true });
    });
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
