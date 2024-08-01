import {
  fetchArrayBuffer,
  FetchResult,
  getCachedData,
  responseToArrayBufferData,
} from '@/shared/lib';

import { getTrackDownloadUrl } from '../api';

interface TrackLoadData {
  uuid: string;
  cache: boolean;
}

self.onmessage = async (event: MessageEvent<TrackLoadData>) => {
  const data = await downloadTrack(event.data.uuid, event.data.cache);

  if (!data.data) {
    self.postMessage(null);
    return;
  }

  const arrayBuffer = data.data;

  self.postMessage(arrayBuffer, { transfer: [arrayBuffer] });
};

const downloadTrack = async (
  uuid: string,
  cache: boolean,
): Promise<FetchResult<ArrayBuffer>> => {
  const cacheName = 'tracks';

  const trackUrl = getTrackDownloadUrl(uuid);

  const req = new Request(trackUrl, {
    headers: {
      Authorization: 'Bearer 1e10f824-8fb2-4951-9815-d84d7bb141f5',
    },
  });

  if (cache) {
    const cachedData = await getCachedData(cacheName, trackUrl);

    if (cachedData) {
      return await responseToArrayBufferData(cachedData);
    }

    const cacheStorage = await caches.open(cacheName);

    await cacheStorage.add(req);

    const res = await getCachedData(cacheName, trackUrl);

    if (!res) {
      throw new Error('Failed to get from cache or fetch');
    }

    return responseToArrayBufferData(res);
  } else {
    return await fetchArrayBuffer(req);
  }
};
