'use client';

import { useCallback, useRef, useState } from 'react';

import { getDroppedFiles, preventAll } from '@/shared/lib';

import { AudioEditor } from '@/entities/audio-editor';
import { addTrackLast } from '@/entities/playlist';

import { checkDragFilesMimeType } from './checkDragFilesMimeType';

export const useTrackImportMenu = (audioEditor: AudioEditor) => {
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
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

      if (isFileUploading) {
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

  const onCancelUpload = useCallback(() => {
    setDroppedFiles(null);
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDroppedFiles(null);
    }
  }, []);

  return {
    isFileUploading,
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
