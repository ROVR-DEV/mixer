'use client';

import { observer } from 'mobx-react-lite';
import { forwardRef } from 'react';

import { AudioEditorFloatingToolbarMemoized } from '@/entities/audio-editor';

import { useFloatingToolbarTools } from '../../lib';

import { AudioEditorFloatingToolbarViewProps } from './interfaces';

export const _AudioEditorFloatingToolbarView = forwardRef<
  HTMLDivElement,
  AudioEditorFloatingToolbarViewProps
>(function AudioEditorFloatingToolbarView({ ...props }, ref) {
  const tools = useFloatingToolbarTools();

  return (
    <AudioEditorFloatingToolbarMemoized ref={ref} tools={tools} {...props} />
  );
});

export const AudioEditorFloatingToolbarView = observer(
  _AudioEditorFloatingToolbarView,
);
