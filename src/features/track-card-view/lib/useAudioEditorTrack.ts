'use client';

import { throttle } from 'lodash-es';
import { runInAction } from 'mobx';
import React, { RefObject, useCallback, useEffect, useMemo } from 'react';

import { clamp } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

import { AudioEditor, Timeline } from '@/entities/audio-editor';
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
  audioEditor: AudioEditor,
  timeline: Timeline,
  disableInteractive?: boolean,
) => {
  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const grid = (timeline.timelineContainer.timelineRef.current as HTMLElement)
    ?.parentElement;

  const { trackWidth, trackStartXGlobal, trackEndXGlobal } = useMemo(
    () =>
      getTrackCoordinates(
        track.trimStartTime,
        track.trimEndTime,
        timeline.timelineContainer.pixelsPerSecond,
      ),
    [
      track.trimStartTime,
      track.trimEndTime,
      timeline.timelineContainer.pixelsPerSecond,
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

    const virtualScrollOffsetX = timeline.scroll * timeline.pixelsPerSecond;
    const bufferViewWidth = 400;

    const isVisible =
      trackStartXGlobal <
        timeline.timelineClientWidth + virtualScrollOffsetX + bufferViewWidth &&
      trackEndXGlobal > virtualScrollOffsetX - bufferViewWidth;

    if (isVisible) {
      trackRef.current.classList.remove('content-hidden');
    } else {
      trackRef.current.classList.add('content-hidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackEndXGlobal, trackRef, trackStartXGlobal]);

  const updateTrackVerticalPosition = useCallback(() => {
    if (disableInteractive) {
      return;
    }

    if (!trackRef.current) {
      return;
    }

    if (!track.dndInfo.isDragging) {
      return;
    }

    if (typeof timeline.trackHeight !== 'number') {
      return;
    }

    if (track.dndInfo.startChannelIndex === undefined) {
      return;
    }

    const prevChannelIndex = track.dndInfo.startChannelIndex;

    const currentChannelIndex = audioEditor.player.channels.indexOf(
      track.channel,
    );

    const channelOffset = currentChannelIndex - prevChannelIndex;

    trackRef.current.style.top =
      channelOffset * timeline.trackHeight + 7 + 'px';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackRef]);

  const globalToLocalCoordinates = useCallback(
    (globalX: number) => {
      const virtualScrollOffsetX =
        timeline.scroll * timeline.timelineContainer.pixelsPerSecond;
      return globalX - virtualScrollOffsetX;
    },
    [timeline.timelineContainer.pixelsPerSecond, timeline.scroll],
  );

  const updateTrackHorizontalPosition = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    const position = globalToLocalCoordinates(
      trackStartXGlobal + timeline.timelineLeftPadding,
    );

    trackRef.current.style.left = `${position}px`;
  }, [
    globalToLocalCoordinates,
    timeline.timelineLeftPadding,
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

    requestAnimationFrame(() => {
      updateTrackVerticalPosition();
      updateTrackHorizontalPosition();
      updateTrackWidth();
      updateTrackVisibility();
    });
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
        timeline.timelineContainer.pixelsPerSecond;

      return clamp(track.dndInfo.startTime + timeOffset, leftBound);
    },
    [timeline.timelineContainer.pixelsPerSecond],
  );

  const setVerticalPosition = throttle(
    useCallback(
      (
        e: MouseEvent,
        track: AudioEditorTrack,
        minChannelIndex: number = 0,
        maxChannelIndex: number = audioEditor.player.channels.length - 1,
      ) => {
        if (!trackRef.current) {
          return;
        }

        if (track.dndInfo.startChannelIndex === undefined) {
          return;
        }

        if (typeof timeline.trackHeight !== 'number') {
          return;
        }

        const startChannelIndex = track.dndInfo.startChannelIndex;

        const currentChannelIndex = audioEditor.player.channels.indexOf(
          track.channel,
        );

        const offsetY = timeline.boundingClientRect.y - (grid?.scrollTop ?? 0);

        const newChannelIndex = getNewChannelIndex(
          e.pageY - offsetY,
          track.dndInfo.startY - offsetY,
          timeline.trackHeight,
          startChannelIndex,
          minChannelIndex,
          maxChannelIndex,
        );

        if (newChannelIndex === currentChannelIndex) {
          return;
        }

        const newChannel = audioEditor.player.channels[newChannelIndex];

        if (!newChannel || track.channel.id === newChannel.id) {
          return;
        }

        track.channel = newChannel;
      },
      [
        audioEditor.player.channels,
        trackRef,
        timeline.trackHeight,
        timeline.boundingClientRect.y,
        grid?.scrollTop,
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
      track.audioBuffer?.setTime(audioEditor.player.time - track.startTime);
    },
    [calcNewStartTime, audioEditor.player.time],
  );

  const handleDragStart = useCallback(
    (e: MouseEvent, track: AudioEditorTrack) => {
      runInAction(() => {
        track.dndInfo.startX = e.pageX;
        track.dndInfo.startY = e.pageY;
        track.dndInfo.startTime = track.trimStartTime;
        track.dndInfo.startChannelIndex = audioEditor.player.channels.indexOf(
          track.channel,
        );
        track.dndInfo.isDragging = true;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setupBounds = useCallback((track: AudioEditorTrack) => {
    runInAction(() => {
      track.dndInfo.leftBound =
        track.dndInfo.startTime - audioEditor.draggingTracksMinStartTime;

      const startChannelIndex =
        track.dndInfo.startChannelIndex ??
        audioEditor.player.channels.indexOf(track.channel);

      track.dndInfo.minChannel =
        startChannelIndex - audioEditor.draggingTracksMinChannelIndex;
      track.dndInfo.maxChannel =
        startChannelIndex +
        audioEditor.player.channels.length -
        1 -
        audioEditor.draggingTracksMaxChannelIndex;
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
      audioEditor.draggingTracks.forEach((selectedTrack) => {
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
    [drag, audioEditor.draggingTracks, setupBounds],
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

      const dropChannelIndex = audioEditor.player.channels.indexOf(
        track.channel,
      );

      if (
        track.dndInfo.startChannelIndex === undefined ||
        track.dndInfo.startChannelIndex === dropChannelIndex
      ) {
        return;
      }
      const startChannel =
        audioEditor.player.channels[track.dndInfo.startChannelIndex];

      if (startChannel) {
        startChannel.removeTrack(track);
      }

      track.channel.addTrack(track);
    },
    [handleDrag, audioEditor.player.channels],
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
        audioEditor.selectTrack(track);
      }

      runInAction(() => {
        audioEditor.draggingTracks = [...audioEditor.selectedTracks];
      });

      setDragProperties(trackRef.current);

      runInAction(() => {
        audioEditor.draggingTracks.forEach((selectedTrack) => {
          handleDragStart(e as MouseEvent, selectedTrack);
        });
      });
    },
    [
      disableInteractive,
      handleDragStart,
      isSelectedInPlayer,
      audioEditor,
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
        audioEditor.draggingTracks.forEach((selectedTrack) =>
          handleDragEnd(e, selectedTrack),
        );

        audioEditor.draggingTracks.forEach(adjustTracksOnPaste);
        audioEditor.draggingTracks = [];

        audioEditor.saveState();
      });
    },
    [disableInteractive, trackRef, audioEditor, handleDragEnd],
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
    timeline.zoomController.addListener(updateTrack);
    timeline.scrollController.addListener(updateTrack);

    updateTrack();

    return () => {
      timeline.zoomController.removeListener(updateTrack);
      timeline.scrollController.removeListener(updateTrack);
    };
  }, [
    track.startTrimDuration,
    track.endTrimDuration,
    track.channel,
    track.startTime,
    timeline.scrollController,
    timeline.zoomController,
    updateTrack,
  ]);

  return { onMouseUp, onMouseDown };
};
