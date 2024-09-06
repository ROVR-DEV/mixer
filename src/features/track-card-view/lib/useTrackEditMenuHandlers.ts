import { useCallback, useMemo } from 'react';

import { AudioEditor } from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

import { snapTo } from './snapTo';

export const useTrackEditMenuHandlers = (
  audioEditor: AudioEditor,
  track: AudioEditorTrack,
) => {
  const onSnapLeft = useCallback(() => {
    snapTo(track, 'left', audioEditor.player.tracks);
    audioEditor.saveState();
  }, [audioEditor, track]);

  const onSnapRight = useCallback(() => {
    snapTo(track, 'right', audioEditor.player.tracks);
    audioEditor.saveState();
  }, [audioEditor, track]);

  const onResetFades = useCallback(() => {
    track.filters.fadeInNode.linearFadeInDuration(0);
    track.filters.fadeOutNode.linearFadeOutDuration(0);
  }, [track]);

  const onRename = useCallback(() => {
    track.isEditingTitle = true;
  }, [track]);

  return useMemo(
    () => ({
      onRename,
      onSnapLeft,
      onSnapRight,
      onResetFades,
    }),
    [onRename, onResetFades, onSnapLeft, onSnapRight],
  );
};
