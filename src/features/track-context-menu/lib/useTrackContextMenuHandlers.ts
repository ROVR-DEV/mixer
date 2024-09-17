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

    audioEditor.removeTrack(track, false);

    const res = await removeTrack(
      audioEditor.player.playlist.id,
      track.meta.uuid,
    );

    if (res.error) {
      // TODO: add to retry queue
    } else {
      track.dispose();
      audioEditor.player.trackLoader.deleteTrack(track.meta);
    }
  }, [audioEditor, track]);

  return useMemo(() => ({ onTrackRemove }), [onTrackRemove]);
};
