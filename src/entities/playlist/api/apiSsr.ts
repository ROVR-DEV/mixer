import { responseToJsonData, responseErrorToData } from '@/shared/lib';

import { convertPlaylistToDto } from '../lib';
import { PlaylistDTO } from '../model';

export const getPlaylist = async (
  id: string,
): Promise<{ data: PlaylistDTO | undefined; error: Error | undefined }> => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/site/playlist/${id}`, {
      cache: 'force-cache',
    });

    const jsonData = await responseToJsonData(res);
    return { ...jsonData, data: convertPlaylistToDto(jsonData.data) };
  } catch (error) {
    return responseErrorToData(error as Error);
  }
};
