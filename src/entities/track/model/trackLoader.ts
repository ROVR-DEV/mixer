import { groupBy } from 'lodash-es';
import {
  ObservableMap,
  computed,
  makeAutoObservable,
  observable,
  values,
} from 'mobx';

import { FetchResult } from '@/shared/lib';

import { getTrackFromCache, getTrackPlayUrl } from '../api';

import { Track } from './track';
import { TrackData } from './trackData';

const MAX_RETRIES_COUNT = 5;
const MAX_SIMULTANEOUS_REQUESTS = 4;

export interface TrackLoaderState {
  tracksData: Map<string, TrackData>;
}

export type OnTrackLoaded = (trackData: TrackData) => void;

export interface TrackLoader {
  readonly tracksData: Map<string, TrackData>;
  readonly loadedTracksCount: number;

  downloadTracks: (tracks: Track[], onLoaded?: OnTrackLoaded) => Promise<void>;
  downloadTrack: (uuid: Track, onLoaded?: OnTrackLoaded) => Promise<void>;

  clearData: () => void;

  getState(): TrackLoaderState;
  restoreState(state: TrackLoaderState): void;
}

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
    onLoaded?: OnTrackLoaded,
  ): Promise<void> => {
    this._ensureTracksDataExists(tracks);

    const checkedTracks = await Promise.all(
      tracks.map(async (track) => ({
        track: track,
        data: await getTrackFromCache(getTrackPlayUrl(track.uuid)),
      })),
    );

    const groupedTracks = groupBy(checkedTracks, (checkedTrack) =>
      checkedTrack.data !== false ? 'cached' : 'uncached',
    );

    const cachedTracks = groupedTracks.cached as
      | typeof groupedTracks.cached
      | undefined;
    const uncachedTracks = groupedTracks.uncached as
      | typeof groupedTracks.uncached
      | undefined;

    cachedTracks?.forEach(async (cachedTrack) => {
      const trackData = this._ensureTrackDataExists(cachedTrack.track);
      const data = await (cachedTrack.data as Response).arrayBuffer();
      trackData.setDataAsArrayBuffer(data);
      onLoaded?.(trackData);
    });

    if (uncachedTracks === undefined || uncachedTracks.length === 0) {
      return;
    }

    // Run MAX_SIMULTANEOUS_REQUESTS requests at once
    const requests = uncachedTracks
      .slice(0, MAX_SIMULTANEOUS_REQUESTS)
      .map((uncachedTrack) =>
        this.downloadTrack(uncachedTrack.track, onLoaded),
      );

    // Run the rest in parallel when the first request are done
    let current_track_index = MAX_SIMULTANEOUS_REQUESTS;
    requests.forEach(async (request) => {
      await request;

      while (current_track_index < uncachedTracks.length) {
        await this.downloadTrack(
          uncachedTracks[current_track_index].track,
          onLoaded,
        );
        current_track_index++;
      }
    });
  };

  downloadTrack = async (
    track: Track,
    onLoaded?: OnTrackLoaded,
    force: boolean = false,
  ): Promise<void> => {
    const trackData = this._ensureTrackDataExists(track);

    if (trackData.status !== 'empty' && !force) {
      return;
    }

    trackData.status = 'loading';

    let attempt = 0;
    while (attempt < MAX_RETRIES_COUNT) {
      try {
        const res = await loadTrackThroughWorker(track.uuid);

        if (res.data) {
          trackData.setDataAsArrayBuffer(res.data);
          onLoaded?.(trackData);
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

  private _ensureTracksDataExists = (tracks: Track[]): TrackData[] => {
    return tracks.map((track) => this._ensureTrackDataExists(track));
  };

  private _ensureTrackDataExists = (track: Track): TrackData => {
    if (this.tracksData.has(track.uuid)) {
      return this.tracksData.get(track.uuid)!;
    }

    this.tracksData.set(track.uuid, new TrackData(track.uuid));
    return this.tracksData.get(track.uuid)!;
  };
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
