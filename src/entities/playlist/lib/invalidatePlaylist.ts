'use server';

import { revalidateTag } from 'next/cache';

export const invalidatePlaylist = (playlistId: number) => {
  revalidateTag(`playlist-${playlistId}`);
};
