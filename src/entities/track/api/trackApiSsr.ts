import { responseToBlobData, responseErrorToData } from '@/shared/lib';
import { getCachedData } from '@/shared/lib/getCachedData';

export const TRACK_BASE_URL = 'https://app.rovr.live/api/track';

export const getTrack = async (
  uuid: string,
  cached: boolean = true,
): Promise<{ data: Blob | undefined; error: Error | undefined }> => {
  const cacheName = 'tracks';

  const trackUrl = `${TRACK_BASE_URL}/${uuid}/play`;

  const req = new Request(trackUrl, {
    headers: {
      Authorization: 'Bearer 1e10f824-8fb2-4951-9815-d84d7bb141f5',
    },
  });

  try {
    if (cached) {
      const cachedData = await getCachedData(cacheName, trackUrl);

      if (cachedData) {
        return responseToBlobData(cachedData);
      }
      const cacheStorage = await caches.open(cacheName);

      await cacheStorage.add(req);

      const res = await getCachedData(cacheName, trackUrl);

      if (!res) {
        throw new Error('Failed to get from cache or fetch');
      }

      return responseToBlobData(res);
    }

    return await responseToBlobData(await fetch(req));
  } catch (error) {
    return responseErrorToData(null, error as Error);
  }
};
