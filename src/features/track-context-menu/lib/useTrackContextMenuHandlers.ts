import { useCallback, useMemo } from 'react';

import { AudioEditor } from '@/entities/audio-editor';
import { removeTrack } from '@/entities/playlist';
import { AudioEditorTrack } from '@/entities/track';

export const useTrackContextMenuHandlers = (
  audioEditor: AudioEditor,
  track: AudioEditorTrack,
) => {
  const onTrackRemove = useCallback(async () => {
    if (audioEditor.player.playlist?.id === undefined) {
      return;
    }

    track.channel.removeTrack(track);

    const res = await removeTrack(
      audioEditor.player.playlist.id,
      track.meta.uuid,
    );

    if (res.error) {
      track.channel.addTrack(track);
    } else {
      track.dispose();
    }
  }, [audioEditor.player.playlist?.id, track]);

  return useMemo(() => ({ onTrackRemove }), [onTrackRemove]);
};
