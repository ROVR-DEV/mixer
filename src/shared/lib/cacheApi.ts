export const getCachedData = async (cacheName: string, url: string) => {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }

  return cachedResponse;
};

export const removeCachedData = async (cacheName: string, url: string) => {
  const cacheStorage = await caches.open(cacheName);
  return await cacheStorage.delete(url);
};
