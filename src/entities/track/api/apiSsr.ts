import { HEADERS_WITH_AUTHORIZATION } from '@/shared/config';
import {
  fetchArrayBuffer,
  FetchResult,
  getCachedData,
  responseToArrayBufferData,
} from '@/shared/lib';

import { getTrackPlayUrl } from './endpoints';

export const getTrack = async (
  uuid: string,
  cache: boolean = true,
): Promise<FetchResult<ArrayBuffer>> => {
  const req = new Request(getTrackPlayUrl(uuid), {
    headers: HEADERS_WITH_AUTHORIZATION,
  });

  if (cache) {
    try {
      const res = await loadTrackAndPutInCache(req);

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

const TRACKS_CACHE_NAME = 'tracks';

export const getTrackFromCache = async (
  url: string,
): Promise<false | Response> => getCachedData(TRACKS_CACHE_NAME, url);

// Returns cached data or load if not in cache
// Returns false if request fails or any error
export const loadTrackAndPutInCache = async (
  request: Request,
): Promise<false | Response> => {
  const cachedResponse = await getTrackFromCache(request.url);

  if (cachedResponse) {
    return cachedResponse;
  }

  const cacheStorage = await caches.open(TRACKS_CACHE_NAME);
  await cacheStorage.add(request);

  return await getTrackFromCache(request.url);
};
