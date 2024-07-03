'use client';

import { throttle } from 'lodash-es';
import { runInAction } from 'mobx';
import React, { RefObject, useCallback, useEffect, useMemo } from 'react';

import { clamp } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

import { Player, TimelineController } from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

import { getNewChannelIndex } from './getNewChannelIndex';

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
      return;
    }

    if (typeof timelineController.trackHeight !== 'number') {
      return;
    }

    if (!track.dndInfo.startChannelId) {
      return;
    }

    const prevChannelIndex = player.channelIds.indexOf(
      track.dndInfo.startChannelId,
    );
    const currentChannelIndex = player.channelIds.indexOf(track.channel.id);

    const channelOffset = currentChannelIndex - prevChannelIndex;

    trackRef.current.style.top =
      channelOffset * timelineController.trackHeight + 7 + 'px';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackRef]);

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

  const setVerticalPosition = throttle(
    useCallback(
      (
        e: MouseEvent,
        track: AudioEditorTrack,
        minChannelIndex: number = 0,
        maxChannelIndex: number = player.channelIds.length - 1,
      ) => {
        if (!trackRef.current) {
          return;
        }

        if (!track.dndInfo.startChannelId) {
          return;
        }

        if (typeof timelineController.trackHeight !== 'number') {
          return;
        }

        const startChannelIndex = player.channelIds.indexOf(
          track.dndInfo.startChannelId,
        );

        const currentChannelIndex = player.channelIds.indexOf(track.channel.id);

        const offsetY =
          timelineController.boundingClientRect.y - (grid?.scrollTop ?? 0);

        const newChannelIndex = getNewChannelIndex(
          e.pageY - offsetY,
          track.dndInfo.startY - offsetY,
          timelineController.trackHeight,
          startChannelIndex,
          minChannelIndex,
          maxChannelIndex,
        );

        if (newChannelIndex === currentChannelIndex) {
          return;
        }

        const newChannel = player.channels.get(
          player.channelIds[newChannelIndex],
        );

        if (!newChannel || track.channel.id === newChannel.id) {
          return;
        }

        track.channel = newChannel;
      },
      [
        grid?.scrollTop,
        player.channelIds,
        player.channels,
        timelineController.boundingClientRect.y,
        timelineController.trackHeight,
        trackRef,
      ],
    ),
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

  const handleDragStart = useCallback(
    (e: MouseEvent, track: AudioEditorTrack) => {
      runInAction(() => {
        track.dndInfo.startX = e.pageX;
        track.dndInfo.startY = e.pageY;
        track.dndInfo.startTime = track.trimStartTime;
        track.dndInfo.startChannelId = track.channel.id;
        track.dndInfo.isDragging = true;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setupBounds = useCallback((track: AudioEditorTrack) => {
    runInAction(() => {
      track.dndInfo.leftBound =
        track.dndInfo.startTime - player.draggingTracksMinStartTime;

      const startChannelIndex = player.channelIds.indexOf(
        track.dndInfo.startChannelId ?? track.channel.id,
      );

      track.dndInfo.minChannel =
        startChannelIndex - player.draggingTracksMinChannel;
      track.dndInfo.maxChannel =
        startChannelIndex +
        player.channelIds.length -
        1 -
        player.draggingTracksMaxChannel;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      player.draggingTracks.forEach((selectedTrack) => {
        setupBounds(selectedTrack);
        drag(
          e,
          selectedTrack,
          selectedTrack.dndInfo.leftBound,
          selectedTrack.dndInfo.minChannel,
          selectedTrack.dndInfo.maxChannel,
        );
      });
    },
    [drag, player.draggingTracks, setupBounds],
  );

  const handleDragEnd = useCallback(
    (
      e: MouseEvent | React.MouseEvent<HTMLElement>,
      track: AudioEditorTrack,
    ) => {
      handleDrag(e as MouseEvent);

      runInAction(() => {
        track.dndInfo.isDragging = false;
      });

      if (
        !track.dndInfo.startChannelId ||
        track.dndInfo.startChannelId === track.channel.id
      ) {
        return;
      }
      const startChannel = player.channels.get(track.dndInfo.startChannelId);

      if (startChannel) {
        startChannel.removeTrack(track);
      }

      track.channel.addTrack(track);
    },
    [handleDrag, player.channels],
  );

  const onDragStart = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (disableInteractive) {
        return;
      }

      if (!trackRef.current) {
        return;
      }

      if (!isSelectedInPlayer) {
        player.selectTrack(track);
      }

      runInAction(() => {
        player.draggingTracks.replace(player.selectedTracks);
      });

      setDragProperties(trackRef.current);

      runInAction(() => {
        player.draggingTracks.forEach((selectedTrack) => {
          handleDragStart(e as MouseEvent, selectedTrack);
        });
      });
    },
    [
      disableInteractive,
      handleDragStart,
      isSelectedInPlayer,
      player,
      track,
      trackRef,
    ],
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

      runInAction(() => {
        player.draggingTracks.forEach((selectedTrack) =>
          handleDragEnd(e, selectedTrack),
        );

        player.draggingTracks.forEach(adjustTracksOnPaste);
      });
    },
    [disableInteractive, handleDragEnd, player.draggingTracks, trackRef],
  );

  const { onMouseUp, onMouseDown } = useGlobalDnD({
    onDragStart,
    onDrag,
    onDragEnd,
  });

  useEffect(() => {
    if (!trackRef.current) {
      return;
    }

    if (track.dndInfo.isDragging) {
      setDragProperties(trackRef.current);
    } else {
      clearDragProperties(trackRef.current);
    }
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
    track.channel,
    track.startTime,
    timelineController.scrollController,
    timelineController.zoomController,
    updateTrack,
  ]);

  return { onMouseUp, onMouseDown };
};