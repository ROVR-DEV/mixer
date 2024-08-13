'use client';

import { useCallback, useState } from 'react';

import { getDroppedFiles, preventAll } from '@/shared/lib';

import { AudioEditor } from '@/entities/audio-editor';
import { addTrackLast } from '@/entities/playlist';

export const useTrackImportMenu = (audioEditor: AudioEditor) => {
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      preventAll(e);

      if (audioEditor.player.playlist?.id === undefined) {
        return;
      }

      if (isFileUploading) {
        return;
      }

      const files = getDroppedFiles(e);

      if (files.length === 0) {
        setDroppedFiles(null);
      }

      if (files.length > 1) {
        alert('Now you can upload only one file at the time');
        return;
      }

      setDroppedFiles(files);
    },
    [audioEditor.player.playlist?.id, isFileUploading],
  );

  const onAddToTheEnd = useCallback(async () => {
    if (audioEditor.player.playlist?.id === undefined) {
      return;
    }

    if (!droppedFiles || droppedFiles.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append('track', droppedFiles[0]);

    setIsFileUploading(true);
    await addTrackLast(audioEditor.player.playlist.id, formData);
    setIsFileUploading(false);
    setDroppedFiles(null);
  }, [audioEditor.player.playlist?.id, droppedFiles]);

  const onAddToNewChannel = useCallback(async () => {
    if (audioEditor.player.playlist?.id === undefined) {
      return;
    }

    if (!droppedFiles || droppedFiles.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append('track', droppedFiles[0]);

    localStorage.setItem(
      'nextTrackChannel',
      audioEditor.player.channels.length.toString(),
    );

    setIsFileUploading(true);
    await addTrackLast(audioEditor.player.playlist.id, formData);
    setIsFileUploading(false);
    setDroppedFiles(null);
  }, [
    audioEditor.player.channels.length,
    audioEditor.player.playlist?.id,
    droppedFiles,
  ]);

  const onReplaceExisting = useCallback(() => {}, []);

  return {
    isFileUploading,
    droppedFiles,
    setDroppedFiles,
    onDrop,
    onAddToTheEnd,
    onAddToNewChannel,
    onReplaceExisting,
  };
};
