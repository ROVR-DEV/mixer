import { Playlist } from '../model';

export const getTrack = async (
  id: string,
): Promise<{ data: Playlist | undefined; error: Error | undefined }> => {
  try {
    const res = await fetch(
      `${process.env.BACKEND_API_URL}/site/playlist/${id}`,
      { cache: 'force-cache' },
    );

    return { data: await res.json(), error: undefined };
  } catch (error) {
    return { data: undefined, error: error as Error };
  }
};
