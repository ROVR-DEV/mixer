'use client';

import { useCallback, useRef, useState } from 'react';

import { getDroppedFiles, preventAll } from '@/shared/lib';

import { AudioEditor } from '@/entities/audio-editor';
import { toPlaylist } from '@/entities/playlist';

import { checkDragFilesMimeType } from './checkDragFilesMimeType';

export const useTrackImportMenu = (audioEditor: AudioEditor) => {
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const isOnlyAudioFilesRef = useRef(false);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    isOnlyAudioFilesRef.current = checkDragFilesMimeType(
      e.dataTransfer.items,
      (type) => type.startsWith('audio'),
    );
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!isOnlyAudioFilesRef.current) {
      e.dataTransfer.effectAllowed = 'none';
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      preventAll(e);

      if (audioEditor.player.playlist?.id === undefined) {
        return;
      }

      if (audioEditor.player.trackLoader.isUploading) {
        return;
      }

      const files = getDroppedFiles(e);

      if (files.length === 0 || !isOnlyAudioFilesRef.current) {
        setDroppedFiles(null);
        return;
      }

      if (files.length > 1) {
        alert('Now you can upload only one file at the time');
        setDroppedFiles(null);
        return;
      }

      setDroppedFiles(files);
    },
    [
      audioEditor.player.playlist?.id,
      audioEditor.player.trackLoader.isUploading,
    ],
  );

  const onAddToTheEnd = useCallback(async () => {
    if (audioEditor.player.playlist?.id === undefined) {
      return;
    }

    if (!droppedFiles || droppedFiles.length === 0) {
      return;
    }

    const res = await audioEditor.player.trackLoader.uploadTrack(
      audioEditor.player.playlist.id,
      droppedFiles[0],
    );

    if (res.data) {
      audioEditor.hydration(toPlaylist(res.data));
    }

    setDroppedFiles(null);
  }, [audioEditor, droppedFiles]);

  const onAddToNewChannel = useCallback(async () => {
    if (audioEditor.player.playlist?.id === undefined) {
      return;
    }

    if (!droppedFiles || droppedFiles.length === 0) {
      return;
    }

    localStorage.setItem(
      'nextTrackChannel',
      audioEditor.player.channels.length.toString(),
    );

    const res = await audioEditor.player.trackLoader.uploadTrack(
      audioEditor.player.playlist.id,
      droppedFiles[0],
    );

    if (res.data) {
      audioEditor.hydration(toPlaylist(res.data));
    }

    setDroppedFiles(null);
  }, [audioEditor, droppedFiles]);

  const onCancelUpload = useCallback(() => {
    setDroppedFiles(null);
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDroppedFiles(null);
    }
  }, []);

  return {
    droppedFiles,
    onDragEnter,
    onDragOver,
    onDrop,
    onOpenChange,
    onAddToTheEnd,
    onAddToNewChannel,
    onCancelUpload,
  };
};
