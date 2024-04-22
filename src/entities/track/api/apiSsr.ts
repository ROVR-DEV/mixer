import { Playlist } from '../model';

export const getPlaylist = async (
  id: string,
): Promise<{ data: Playlist | undefined; error: Error | undefined }> => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/site/playlist/${id}`, {
      cache: 'force-cache',
    });

    return { data: await res.json(), error: undefined };
  } catch (error) {
    return { data: undefined, error: error as Error };
  }
};

export const getTrack = async (
  uuid: string,
): Promise<{ data: Blob | undefined; error: Error | undefined }> => {
  const baseUrl =
    typeof window === 'undefined' ? process.env.BACKEND_API_URL : 'api';

  try {
    const res = await fetch(`${baseUrl}/track/${uuid}/play`, {
      headers: {
        Authorization: 'Bearer 1e10f824-8fb2-4951-9815-d84d7bb141f5',
        'x-id': (Math.random() * 10000).toString(),
      },
      cache: 'no-cache',
    });

    return {
      data: new Blob([await res.arrayBuffer()], {
        type: res.headers.get('content-type') ?? '',
      }),
      error: undefined,
    };
  } catch (error) {
    return { data: undefined, error: error as Error };
  }
};
