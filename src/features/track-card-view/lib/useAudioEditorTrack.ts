'use client';

import { throttle } from 'lodash-es';
import { runInAction } from 'mobx';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { clamp, useRepeatFun } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

import {
  AudioEditor,
  isMouseInScrollBounds,
  shiftXTimeline,
  Timeline,
} from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

import { getNewChannelIndex } from './getNewChannelIndex';

import { adjustTracksOnPaste, clearDragProperties, setDragProperties } from '.';

export const useAudioEditorTrack = (
  trackRef: RefObject<HTMLDivElement>,
  track: AudioEditorTrack,
  audioEditor: AudioEditor,
  timeline: Timeline,
  disableInteractive?: boolean,
) => {
  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const grid = timeline.container?.parentElement;

  const { trimStartXGlobal, trimEndXGlobal } = useMemo(() => {
    const trimStartXGlobal = timeline.timeToGlobal(track.trimStartTime);
    const trimEndXGlobal = timeline.timeToGlobal(track.trimEndTime);
    const trackWidth = trimEndXGlobal - trimStartXGlobal;

    return {
      trimStartXGlobal: trimStartXGlobal,
      trimEndXGlobal: trimEndXGlobal,
      trackWidth,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    track.trimStartTime,
    track.trimEndTime,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffsetX,
  ]);

  const updateTrackWidth = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    const startX = clamp(
      trimStartXGlobal,
      timeline.viewportBoundsWithBuffer.start,
    );
    const endX = clamp(
      trimEndXGlobal,
      startX,
      timeline.viewportBoundsWithBuffer.end,
    );
    const adjustedTrackWidth = endX - startX;

    const newWidth = `${adjustedTrackWidth}px`;

    if (trackRef.current.style.width === newWidth) {
      return;
    }

    trackRef.current.style.width = newWidth;
  }, [
    trimEndXGlobal,
    trackRef,
    trimStartXGlobal,
    timeline.viewportBoundsWithBuffer.end,
    timeline.viewportBoundsWithBuffer.start,
  ]);

  const updateTrackVisibility = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    const bufferViewWidth = 400;

    const isVisible =
      trimStartXGlobal <
        timeline.clientWidth + timeline.hScroll + bufferViewWidth &&
      trimEndXGlobal > timeline.hScroll - bufferViewWidth;

    if (isVisible) {
      trackRef.current.classList.remove('content-hidden');
    } else {
      trackRef.current.classList.add('content-hidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimEndXGlobal, trackRef, trimStartXGlobal]);

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
      channelOffset * timeline.trackHeight + 6 + 'px';
  }, [disableInteractive, trackRef, track, audioEditor, timeline.trackHeight]);

  const updateTrackHorizontalPosition = useCallback(() => {
    if (!trackRef.current) {
      return;
    }

    const position = timeline.globalToLocal(
      clamp(
        trimStartXGlobal,
        timeline.viewportBoundsWithBuffer.start,
        timeline.viewportBoundsWithBuffer.end,
      ),
    );

    trackRef.current.style.left = `${position}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeline,
    trackRef,
    trimStartXGlobal,
    timeline.viewportBoundsWithBuffer.start,
  ]);

  const calcNewStartTime = useCallback(
    (
      pageX: number,
      track: AudioEditorTrack,
      leftBound: number = 0,
      rightBound: number = 0,
    ) => {
      const currentTime = timeline.globalToTime(pageX);
      const dragStartTime = timeline.globalToTime(track.dndInfo.startX);

      const timeOffset =
        currentTime -
        dragStartTime -
        track.dndInfo.scroll / timeline.hPixelsPerSecond +
        timeline.hScroll / timeline.hPixelsPerSecond;

      return clamp(track.dndInfo.startTime + timeOffset, leftBound, rightBound);
    },
    [timeline],
  );

  const setTime = useCallback(
    (
      pageX: number,
      track: AudioEditorTrack,
      leftBound: number = 0,
      rightBound: number = Infinity,
    ) => {
      // console.log('Set time');
      // console.log(track.id, rightBound);

      const startTime = calcNewStartTime(pageX, track, leftBound, rightBound);

      if (track.trimStartTime === startTime) {
        return;
      }

      track.setStartTime(startTime);
      track.audio.setTime(audioEditor.player.time - track.startTime);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calcNewStartTime],
  );

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

  const handleDragStart = useCallback(
    (e: MouseEvent, track: AudioEditorTrack) => {
      runInAction(() => {
        track.dndInfo.scroll = timeline.hScroll;
        track.dndInfo.currentX = e.pageX;
        track.dndInfo.startX = e.pageX;
        track.dndInfo.startY = e.pageY;
        track.dndInfo.startTime = track.trimStartTime;
        track.dndInfo.endTime = track.trimEndTime;
        track.dndInfo.duration = track.trimDuration;
        track.dndInfo.startChannelIndex = audioEditor.player.channels.indexOf(
          track.channel,
        );
        track.dndInfo.isDragging = true;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setupBounds = useCallback(
    (track: AudioEditorTrack) => {
      runInAction(() => {
        track.dndInfo.leftBound =
          track.dndInfo.startTime - audioEditor.draggingTracksMinStartTime;

        track.dndInfo.rightBound =
          timeline.endTime -
          track.trimDuration -
          (audioEditor.draggingTracksMaxEndTime - track.dndInfo.endTime);

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
    },
    [audioEditor, timeline],
  );

  const { repeat: repeatDragUpdate, stop: stopDragUpdate } = useRepeatFun();

  const drag = useCallback(
    (
      e: MouseEvent,
      track: AudioEditorTrack,
      leftBound: number = 0,
      rightBound: number = Infinity,
      minChannel: number = 0,
      maxChannel: number = Infinity,
    ) => {
      const dragUpdate = () => {
        track.dndInfo.currentX = e.pageX;
        setTime(e.pageX, track, leftBound, rightBound);
        setVerticalPosition(e, track, minChannel, maxChannel);
      };

      repeatDragUpdate(() => {
        const bounds = isMouseInScrollBounds(e.x, timeline);

        if (bounds.leftBound === undefined && bounds.rightBound === undefined) {
          dragUpdate();
          stopDragUpdate();
          return false;
        }

        shiftXTimeline(e.x, timeline);
        dragUpdate();
      });
    },
    [repeatDragUpdate, timeline, setTime, setVerticalPosition, stopDragUpdate],
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      audioEditor.draggingTracks.forEach((selectedTrack) => {
        setupBounds(selectedTrack);

        drag(
          e,
          selectedTrack,
          selectedTrack.dndInfo.leftBound,
          selectedTrack.dndInfo.rightBound,
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
        track.channel.sortTracks();
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

      if (!disableInteractive) {
        setDragProperties(trackRef.current);
      }

      runInAction(() => {
        audioEditor.draggingTracks.forEach((draggingTrack) =>
          handleDragStart(e as MouseEvent, draggingTrack),
        );
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

  const lastMouseEventRef = useRef<MouseEvent | null>(null);

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (disableInteractive) {
        return;
      }

      lastMouseEventRef.current = e;

      handleDrag(e);
    },
    [disableInteractive, handleDrag],
  );

  const onDragEnd = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
      stopDragUpdate();
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
    [stopDragUpdate, disableInteractive, trackRef, audioEditor, handleDragEnd],
  );

  const { isDragging, onMouseUp, onMouseDown } = useGlobalDnD({
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
      stopDragUpdate();
      clearDragProperties(trackRef.current);
    }
  }, [stopDragUpdate, track.dndInfo.isDragging, trackRef]);

  useEffect(() => {
    updateTrack();
  }, [
    track.startTrimDuration,
    track.endTrimDuration,
    track.channel,
    track.startTime,
    updateTrack,
  ]);

  // Stop drag on unmount
  useEffect(() => {
    return () => {
      if (lastMouseEventRef.current) {
        runInAction(() => {
          track.dndInfo.isDragging = false;
        });
        stopDragUpdate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopDragUpdate]);

  useEffect(() => {
    timeline.zoomController.addListener(updateTrack);
    timeline.hScrollController.addListener(updateTrack);

    updateTrack();

    return () => {
      timeline.zoomController.removeListener(updateTrack);
      timeline.hScrollController.removeListener(updateTrack);
    };
  }, [timeline.hScrollController, timeline.zoomController, updateTrack]);

  return { isDragging, onMouseUp, onMouseDown };
};
