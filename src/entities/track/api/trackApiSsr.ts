import {
  fetchArrayBuffer,
  FetchResult,
  responseToArrayBufferData,
} from '@/shared/lib';
import { getCachedData } from '@/shared/lib/getCachedData';

export const TRACK_BASE_URL = 'https://app.rovr.live/api/track';

export const getTrack = async (
  uuid: string,
  cache: boolean = true,
): Promise<FetchResult<ArrayBuffer>> => {
  const cacheName = 'tracks';

  const trackUrl = `${TRACK_BASE_URL}/${uuid}/play`;

  const req = new Request(trackUrl, {
    headers: {
      Authorization: 'Bearer 1e10f824-8fb2-4951-9815-d84d7bb141f5',
    },
  });

  if (cache) {
    try {
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
    } catch (err) {
      return { data: undefined, error: err as Error, response: null };
    }
  } else {
    return await fetchArrayBuffer(req);
  }
};
