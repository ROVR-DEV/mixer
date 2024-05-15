import { responseToJsonData, responseErrorToData } from '@/shared/lib';

import { Playlist } from '../model';

export const getPlaylist = async (
  id: string,
): Promise<{ data: Playlist | undefined; error: Error | undefined }> => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/site/playlist/${id}`, {
      cache: 'force-cache',
    });

    return await responseToJsonData(res);
  } catch (error) {
    return responseErrorToData(error as Error);
  }
};
