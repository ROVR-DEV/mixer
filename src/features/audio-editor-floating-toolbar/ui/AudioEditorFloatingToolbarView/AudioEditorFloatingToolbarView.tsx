'use client';

import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

import {
  CursorIcon,
  FitIcon,
  LoopIcon,
  MagnetIcon,
  MagnifierIcon,
  RedoIcon,
  ScissorsIcon,
  UndoIcon,
} from '@/shared/ui/assets';

import {
  AudioEditorFloatingToolbarMemoized,
  AudioEditorTool,
  ToolGroup,
  useAudioEditor,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarViewProps } from './interfaces';

const TOOL_ICONS: Record<AudioEditorTool, JSX.Element> = {
  cursor: <CursorIcon />,
  scissors: <ScissorsIcon />,
  magnifier: <MagnifierIcon />,
};

export const AudioEditorFloatingToolbarView = observer(
  function AudioEditorFloatingToolbarView({
    toolbarRef,
    ...props
  }: AudioEditorFloatingToolbarViewProps) {
    const audioEditor = useAudioEditor();

    const tools = useMemo(
      () =>
        [
          {
            name: 'Tools',
            buttons: audioEditor.options.availableTools.map((tool) => ({
              name: tool,
              icon: TOOL_ICONS[tool],
              isActive: tool == audioEditor.tool,
              onClick: () => {
                audioEditor.tool = tool;
              },
            })),
          },
          {
            name: 'Actions',
            buttons: [
              {
                name: 'loop',
                icon: <LoopIcon />,
                isActive: audioEditor.player.region.isEnabled,
                onClick: () => audioEditor.player.region.toggle(),
              },
              {
                name: 'fit',
                icon: <FitIcon />,
                isActive: false,
                onClick: () => audioEditor.fit(),
                fillType: 'fill',
              },
              {
                name: 'magnet',
                icon: <MagnetIcon />,
                isActive: false,
                onClick: () => {},
              },
            ],
          },
          {
            name: 'Undo/Redo',
            buttons: [
              {
                name: 'undo',
                icon: <UndoIcon />,
                isActive: false,
                onClick: () => {
                  audioEditor.undo();
                },
              },
              {
                name: 'redo',
                icon: <RedoIcon />,
                isActive: false,
                onClick: () => {
                  audioEditor.redo();
                },
              },
            ],
          },
        ] satisfies ToolGroup[],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [audioEditor.tool, audioEditor.player.region.isEnabled],
    );

    return (
      <AudioEditorFloatingToolbarMemoized
        ref={toolbarRef}
        tools={tools}
        {...props}
      />
    );
  },
);
