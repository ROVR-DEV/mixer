import {
  checkCollision,
  checkVerticalCollision,
} from '@/shared/lib/checkCollision';
import { Rect } from '@/shared/model';

import { AudioEditor, Timeline } from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

const getChannelVerticalBound = (index: number, timeline: Timeline) => {
  if (typeof timeline.trackHeight !== 'number') {
    return { startY: 0, endY: 0 };
  }

  const startY = index * timeline.trackHeight;
  const endY = startY + timeline.trackHeight + 14;

  return { startY: startY, endY: endY };
};

const selectTrackInSelection = (
  track: AudioEditorTrack,
  audioEditor: AudioEditor,
  timeline: Timeline,
  channelStartY: number,
  rect: Rect,
  addToSelection: boolean = false,
) => {
  if (typeof timeline.trackHeight !== 'number') {
    return;
  }

  const isIntersects = checkCollision(
    new Rect(
      timeline.timeToGlobal(track.trimStartTime),
      channelStartY + 7,
      timeline.timeToPixels(track.trimDuration),
      timeline.trackHeight - 14,
    ),
    rect,
  );

  const isSelected = audioEditor.isTrackSelected(track);

  if (isIntersects && !isSelected) {
    audioEditor.selectTrack(track, true);
  } else if (!isIntersects && isSelected && !addToSelection) {
    audioEditor.unselectTrack(track);
  }
};

export const selectTracksInSelection = (
  audioEditor: AudioEditor,
  timeline: Timeline,
  rect: Rect,
  addToSelection: boolean = false,
) => {
  audioEditor.player.channels.forEach((channel, i) => {
    if (typeof timeline.trackHeight !== 'number') {
      return;
    }

    const virtualRect = new Rect(
      rect.x + timeline.scroll,
      rect.y,
      rect.width,
      rect.height,
    );

    const { startY: channelStartY, endY: channelEndY } =
      getChannelVerticalBound(i, timeline);

    const isChannelIntersects = checkVerticalCollision(
      channelStartY,
      channelEndY,
      virtualRect.y,
      virtualRect.bottom,
    );

    if (!isChannelIntersects) {
      if (!addToSelection) {
        channel.tracks.forEach((track) => audioEditor.unselectTrack(track));
      }
      return;
    }

    channel.tracks.forEach((track) =>
      selectTrackInSelection(
        track,
        audioEditor,
        timeline,
        channelStartY,
        virtualRect,
        addToSelection,
      ),
    );
  });
};
