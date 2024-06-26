'use client';

import React, { RefObject, useCallback, useEffect, useMemo } from 'react';

import { clamp } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

import { Player, TimelineController } from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

import {
  adjustTracksOnPaste,
  clearDragProperties,
  getTrackCoordinates,
  setDragProperties,
} from '.';

export const useAudioEditorTrack = (
  trackRef: RefObject<HTMLDivElement>,
  track: AudioEditorTrack,
  player: Player,
  timelineController: TimelineController,
  disableInteractive?: boolean,
) => {
  const isSelectedInPlayer = player.isTrackSelected(track);

  const grid = (
    timelineController.timelineContainer.timelineRef.current as HTMLElement
  )?.parentElement;

  const { trackWidth, trackStartXGlobal, trackEndXGlobal } = useMemo(
    () =>
      getTrackCoordinates(
        track.trimStartTime,
        track.trimEndTime,
        timelineController.timelineContainer.pixelsPerSecond,
      ),
    [
      track.trimStartTime,
      track.trimEndTime,
      timelineController.timelineContainer.pixelsPerSecond,
    ],
  );

  const updateTrackWidth = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    if (trackRef.current.style.width === `${trackWidth}px`) {
      return;
    }

    trackRef.current.style.width = `${trackWidth}px`;
  }, [trackRef, trackWidth]);

  const updateTrackVisibility = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    const virtualScrollOffsetX =
      timelineController.scroll * timelineController.pixelsPerSecond;
    const bufferViewWidth = 400;

    const isVisible =
      trackStartXGlobal <
        timelineController.timelineClientWidth +
          virtualScrollOffsetX +
          bufferViewWidth &&
      trackEndXGlobal > virtualScrollOffsetX - bufferViewWidth;

    if (isVisible) {
      trackRef.current.classList.remove('content-hidden');
    } else {
      trackRef.current.classList.add('content-hidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackEndXGlobal, trackRef, trackStartXGlobal]);

  const updateTrackVerticalPosition = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    if (!track.dndInfo.isDragging) {
      trackRef.current.style.top = '';
      return;
    }

    if (typeof timelineController.trackHeight !== 'number') {
      return;
    }

    if (!track.dndInfo.prevChannelId) {
      return;
    }

    const prevChannelIndex = player.channelIds.indexOf(
      track.dndInfo.prevChannelId,
    );
    const currentChannelIndex = player.channelIds.indexOf(track.channel.id);

    const channelOffset = currentChannelIndex - prevChannelIndex;

    if (channelOffset == 0) {
      trackRef.current.style.top = '';
      return;
    }

    trackRef.current.style.top =
      channelOffset * timelineController.trackHeight + 7 + 'px';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackRef, track.dndInfo.isDragging]);

  const globalToLocalCoordinates = useCallback(
    (globalX: number) => {
      const virtualScrollOffsetX =
        timelineController.scroll *
        timelineController.timelineContainer.pixelsPerSecond;
      return globalX - virtualScrollOffsetX;
    },
    [
      timelineController.timelineContainer.pixelsPerSecond,
      timelineController.scroll,
    ],
  );

  const updateTrackHorizontalPosition = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    const position = globalToLocalCoordinates(
      trackStartXGlobal + timelineController.timelineLeftPadding,
    );

    trackRef.current.style.left = `${position}px`;
  }, [
    globalToLocalCoordinates,
    timelineController.timelineLeftPadding,
    trackRef,
    trackStartXGlobal,
  ]);

  const updateTrack = useCallback(() => {
    // TODO: performance issue
    // if (track.audioBuffer?.options.minPxPerSec !== pixelsPerSecond) {
    //   requestAnimationFrame(() => {
    //     track.audioBuffer?.setOptions({ minPxPerSec: pixelsPerSecond });
    //   });
    // }

    updateTrackVerticalPosition();
    updateTrackHorizontalPosition();
    updateTrackWidth();
    updateTrackVisibility();
  }, [
    updateTrackHorizontalPosition,
    updateTrackVerticalPosition,
    updateTrackVisibility,
    updateTrackWidth,
  ]);

  const calcNewStartTime = useCallback(
    (
      e: MouseEvent | React.MouseEvent<HTMLElement>,
      track: AudioEditorTrack,
      leftBound: number = 0,
    ) => {
      const timeOffset =
        (e.pageX - track.dndInfo.startX) /
        timelineController.timelineContainer.pixelsPerSecond;

      return clamp(track.dndInfo.startTime + timeOffset, leftBound);
    },
    [timelineController.timelineContainer.pixelsPerSecond],
  );

  const setVerticalPosition = useCallback(
    (
      e: MouseEvent,
      track: AudioEditorTrack,
      minChannel: number = 0,
      maxChannel: number = Infinity,
    ) => {
      if (!trackRef.current) {
        return;
      }

      if (typeof timelineController.trackHeight !== 'number') {
        return;
      }

      const paneStartY =
        timelineController.boundingClientRect.y - (grid?.scrollTop ?? 0);

      const globalChannelIndex = Math.floor(
        (e.pageY - paneStartY) / timelineController.trackHeight,
      );

      if (
        globalChannelIndex >= minChannel &&
        globalChannelIndex < Math.min(maxChannel, player.channelIds.length)
      ) {
        const currentChannel = player.channels.get(
          player.channelIds[globalChannelIndex] ?? player.channelIds.at(-1),
        );

        if (!currentChannel) {
          return;
        }

        if (track.channel.id !== currentChannel.id) {
          track.channel = currentChannel;
        }
      }
    },
    [
      grid?.scrollTop,
      player.channelIds,
      player.channels,
      timelineController.boundingClientRect.y,
      timelineController.trackHeight,
      trackRef,
    ],
  );

  const setTime = useCallback(
    (e: MouseEvent, track: AudioEditorTrack, leftBound: number = 0) => {
      const startTime = calcNewStartTime(e, track, leftBound);

      if (track.trimStartTime === startTime) {
        return;
      }

      track.setStartTime(startTime);
      track.audioBuffer?.setTime(player.time - track.startTime);
    },
    [calcNewStartTime, player.time],
  );

  const dragStart = useCallback(
    (e: MouseEvent, track: AudioEditorTrack) => {
      track.dndInfo = {
        startX: e.pageX,
        startY: e.pageY,
        startTime: track.startTime,
        prevChannelId: track.channel.id,
        isDragging: true,
      };

      if (!isSelectedInPlayer) {
        player.selectTrack(track);
      }
    },
    [isSelectedInPlayer, player],
  );

  const handleDragStart = useCallback(
    (e: MouseEvent) => {
      if (player.selectedTracks.size > 1) {
        player.selectedTracks.forEach((selectedTrack) =>
          dragStart(e, selectedTrack),
        );
        return;
      }

      dragStart(e, track);
    },
    [dragStart, player.selectedTracks, track],
  );

  const drag = useCallback(
    (
      e: MouseEvent,
      track: AudioEditorTrack,
      leftBound: number = 0,
      minChannel: number = 0,
      maxChannel: number = Infinity,
    ) => {
      setTime(e, track, leftBound);
      setVerticalPosition(e, track, minChannel, maxChannel);
    },
    [setTime, setVerticalPosition],
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (player.selectedTracks.size > 1) {
        player.selectedTracks.forEach((selectedTrack) => {
          if (!selectedTrack.dndInfo.prevChannelId) {
            return;
          }

          const channelIndex = player.channelIds.indexOf(
            selectedTrack.dndInfo.prevChannelId,
          );

          drag(
            e,
            selectedTrack,
            selectedTrack.dndInfo.startTime - player.selectedTracksMinStartTime,
            channelIndex - player.selectedTracksMinChannel,
            channelIndex +
              (player.channelIds.length - player.selectedTracksMaxChannel) +
              1,
          );
        });
        return;
      }

      drag(e, track);
    },
    [
      drag,
      player.channelIds,
      player.selectedTracks,
      player.selectedTracksMaxChannel,
      player.selectedTracksMinChannel,
      player.selectedTracksMinStartTime,
      track,
    ],
  );

  const dragEnd = useCallback(
    (
      e: MouseEvent | React.MouseEvent<HTMLElement>,
      track: AudioEditorTrack,
    ) => {
      track.setStartTime(calcNewStartTime(e, track));

      if (track.dndInfo.prevChannelId) {
        if (track.dndInfo.prevChannelId !== track.channel.id) {
          const prevChannel = player.channels.get(track.dndInfo.prevChannelId);

          if (prevChannel) {
            prevChannel.removeTrack(track);
          }

          track.channel.addTrack(track);
        }

        adjustTracksOnPaste(track);
      }

      track.dndInfo = {
        startX: e.pageX,
        startY: e.pageY,
        startTime: track.startTime,
        prevChannelId: undefined,
        isDragging: false,
      };
    },
    [calcNewStartTime, player.channels],
  );

  const handleDragEnd = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (player.selectedTracks.size > 1) {
        player.selectedTracks.forEach((selectedTrack) =>
          dragEnd(e, selectedTrack),
        );
        return;
      }

      dragEnd(e, track);
    },
    [dragEnd, player.selectedTracks, track],
  );

  const onDragStart = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (disableInteractive) {
        return;
      }

      if (!trackRef.current) {
        return;
      }

      setDragProperties(trackRef.current);
      handleDragStart(e as MouseEvent);
    },
    [disableInteractive, handleDragStart, trackRef],
  );

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (disableInteractive) {
        return;
      }

      handleDrag(e);
    },
    [disableInteractive, handleDrag],
  );

  const onDragEnd = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (disableInteractive) {
        return;
      }

      if (!trackRef.current) {
        return;
      }

      clearDragProperties(trackRef.current);
      handleDragEnd(e);
    },
    [disableInteractive, handleDragEnd, trackRef],
  );

  const { onMouseUp, onMouseDown } = useGlobalDnD({
    onDragStart,
    onDrag,
    onDragEnd,
  });

  useEffect(() => {
    timelineController.zoomController.addListener(updateTrack);
    timelineController.scrollController.addListener(updateTrack);

    updateTrack();

    return () => {
      timelineController.zoomController.removeListener(updateTrack);
      timelineController.scrollController.removeListener(updateTrack);
    };
  }, [
    track.startTrimDuration,
    track.endTrimDuration,
    track.dndInfo.isDragging,
    track.channel,
    track.startTime,
    timelineController.scrollController,
    timelineController.zoomController,
    updateTrack,
  ]);

  return { onMouseUp, onMouseDown };
};
