import { observer } from 'mobx-react-lite';

import {
  useHandleTimeSeek,
  usePlayer,
  useTimeline,
} from '@/entities/audio-editor';

import { AudioEditorRegion } from '..';
import { useAudioEditorRegion } from '../../lib';

import { AudioEditorRegionPanelProps } from './interfaces';

export const AudioEditorRegionPanel = observer(function AudioEditorRegionPanel({
  ...props
}: AudioEditorRegionPanelProps) {
  const player = usePlayer();
  const timeline = useTimeline();

  const { onMouseDown } = useAudioEditorRegion(player, timeline);

  const handleTimeSeek = useHandleTimeSeek(player, timeline);

  return (
    <div onMouseDown={onMouseDown} onClick={handleTimeSeek} {...props}>
      <AudioEditorRegion />
    </div>
  );
});
