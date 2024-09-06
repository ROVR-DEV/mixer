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

import { clamp } from '@/shared/lib';
import { useGlobalDnD } from '@/shared/lib/useGlobalDnD';

import { AudioEditor, shiftXTimeline, Timeline } from '@/entities/audio-editor';
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

    const bufferViewWidth = 400;

    const isVisible =
      trackStartXGlobal <
        timeline.timelineClientWidth + timeline.scroll + bufferViewWidth &&
      trackEndXGlobal > timeline.scroll - bufferViewWidth;

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
      channelOffset * timeline.trackHeight + 6 + 'px';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackRef]);

  const globalToLocalCoordinates = useCallback(
    (globalX: number) => {
      return globalX - timeline.scroll;
    },
    [timeline],
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

  const calcNewStartTime = useCallback(
    (pageX: number, track: AudioEditorTrack, leftBound: number = 0) => {
      const currentTime = timeline.mapGlobalToTime(pageX);
      const dragStartTime = timeline.mapGlobalToTime(track.dndInfo.startX);

      const timeOffset =
        currentTime -
        dragStartTime -
        track.dndInfo.scroll / timeline.pixelsPerSecond +
        timeline.scroll / timeline.pixelsPerSecond;

      return clamp(track.dndInfo.startTime + timeOffset, leftBound);
    },
    [timeline],
  );

  const setTime = useCallback(
    (pageX: number, track: AudioEditorTrack, leftBound: number = 0) => {
      const startTime = calcNewStartTime(pageX, track, leftBound);

      if (track.trimStartTime === startTime) {
        return;
      }

      track.setStartTime(startTime);
      track.audioBuffer?.setTime(audioEditor.player.time - track.startTime);
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

  const updateTrackAnimation = useCallback(
    (eventName?: string) => {
      if (eventName !== undefined && track.dndInfo.isDragging) {
        setTime(track.dndInfo.currentX, track, 0);
      }
      requestAnimationFrame(updateTrack);
    },
    [setTime, track, updateTrack],
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

  const handleDragStart = useCallback(
    (e: MouseEvent, track: AudioEditorTrack) => {
      runInAction(() => {
        track.dndInfo.scroll = timeline.scroll;
        track.dndInfo.currentX = e.pageX;
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

  // const calculatePercent = (currentX: number, startX: number, endX: number) =>
  //   ((currentX - startX) / (endX - startX)) * 100;

  // const shiftXTimelineViewport = useCallback(
  //   (e: MouseEvent, track: AudioEditorTrack, leftBound: number) => {
  //     // const timelineElement = timeline.timelineContainer.timelineRef.current;

  //     // if (!timelineElement) {
  //     //   return;
  //     // }

  //     // const { x: mouseX } = e;

  //     // const { x: timelineContainerX, width: timelineContainerWidth } =
  //     //   timelineElement.getBoundingClientRect();

  //     // const sideBoxWidth = 100;

  //     // const leftSideBoxStart = timelineContainerX - sideBoxWidth;
  //     // const leftSideBoxEnd = timelineContainerX + sideBoxWidth;

  //     // const rightSideBoxStart =
  //     //   timelineContainerX + timelineContainerWidth - sideBoxWidth;
  //     // const rightSideBoxEnd = timelineContainerX + timelineContainerWidth;

  //     // const isMouseInLeftSideBox =
  //     //   mouseX < leftSideBoxEnd && mouseX > leftSideBoxStart;
  //     // const isMouseInRightSideBox =
  //     //   mouseX > rightSideBoxStart && mouseX < rightSideBoxEnd;

  //     // let percent: number = 0,
  //     //   time: number = 0;

  //     // let shiftX: number = 0;

  //     // if (isMouseInLeftSideBox) {
  //     //   percent = calculatePercent(mouseX, leftSideBoxEnd, leftSideBoxStart);

  //     //   shiftX = timeline.scrollController.shiftX(-1 * percent);
  //     //   time = Math.max(track.startTime + shiftX, 0);

  //     //   // TODO: make separate function for this logic
  //     //   // TODO: modify setTime or other method to add ability pass custom time calculation instead of calling to separate track methods
  //     //   track.setStartTime(time);
  //     //   track.audioBuffer?.setTime(audioEditor.player.time - track.startTime);
  //     // } else if (isMouseInRightSideBox) {
  //     //   percent = calculatePercent(mouseX, rightSideBoxStart, rightSideBoxEnd);

  //     //   shiftX = timeline.scrollController.shiftX(1 * percent);
  //     //   time = Math.min(
  //     //     track.startTime + shiftX,
  //     //     timeline.totalTime - track.duration,
  //     //   );

  //     //   // TODO: make separate function for this logic
  //     //   // TODO: modify setTime or other method to add ability pass custom time calculation instead of calling to separate track methods
  //     //   track.setStartTime(time);
  //     //   track.audioBuffer?.setTime(audioEditor.player.time - track.startTime);
  //     // } else {
  //     const timelineShiftXTime: number = timeline.scrollController.value;

  //     // wide between track start time and mouse time
  //     const mousePositionTime =
  //       timelineShiftXTime + timeline.pixelsToTime(e.pageX);

  //     const trackWideToMouseWide =
  //       timelineShiftXTime +
  //       timeline.pixelsToTime(track.dndInfo.startX) -
  //       track.dndInfo.startTime;

  //     // eslint-disable-next-line no-console
  //     console.log(
  //       'mousePositionTime - trackWideToMouseWide',
  //       'смещение\n',
  //       timelineShiftXTime,
  //       '\n',
  //       'смещение (мин)\n',
  //       timelineShiftXTime / 60,
  //       '\n',
  //       'сейчас позиция мыши\n',
  //       mousePositionTime,
  //       '\n',
  //       'сейчас позиция мыши (мин)\n',
  //       mousePositionTime / 60,
  //       '\n',
  //       'сейчас размер\n',
  //       trackWideToMouseWide,
  //       '\n',
  //       'значение времени\n',
  //       timelineShiftXTime +
  //         (mousePositionTime - trackWideToMouseWide - timelineShiftXTime),
  //       '\n',
  //       'значение времени (мин)\n',
  //       (timelineShiftXTime +
  //         (mousePositionTime - trackWideToMouseWide - timelineShiftXTime)) /
  //         60,
  //     );

  //     const time = clamp(
  //       timelineShiftXTime + (mousePositionTime - trackWideToMouseWide),
  //       leftBound,
  //     );

  //     track.setStartTime(time);
  //     track.audioBuffer?.setTime(audioEditor.player.time - track.startTime);
  //     // }
  //   },
  //   [timeline, audioEditor.player.time],
  // );

  const dragTimerIdRef = useRef<number | null>(null);

  const drag = useCallback(
    (
      e: MouseEvent,
      track: AudioEditorTrack,
      leftBound: number = 0,
      minChannel: number = 0,
      maxChannel: number = Infinity,
    ) => {
      if (dragTimerIdRef.current !== null) {
        cancelAnimationFrame(dragTimerIdRef.current);
        dragTimerIdRef.current = null;
      }

      const dragUpdate = () => {
        const side = shiftXTimeline(e.x, timeline);
        track.dndInfo.currentX = e.pageX;
        setTime(e.pageX, track, leftBound);
        setVerticalPosition(e, track, minChannel, maxChannel);
        return side;
      };

      const dragUpdateRec = () => {
        if (dragTimerIdRef.current !== null) {
          cancelAnimationFrame(dragTimerIdRef.current);
          dragTimerIdRef.current = null;
        }

        const side = dragUpdate();
        if (side === 0 || !track.dndInfo.isDragging) {
          return;
        }
        dragTimerIdRef.current = requestAnimationFrame(dragUpdateRec);
      };

      requestAnimationFrame(dragUpdateRec);
    },
    [timeline, setTime, setVerticalPosition],
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

      if (dragTimerIdRef.current !== null) {
        cancelAnimationFrame(dragTimerIdRef.current);
        dragTimerIdRef.current = null;
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
      clearDragProperties(trackRef.current);

      if (dragTimerIdRef.current !== null) {
        cancelAnimationFrame(dragTimerIdRef.current);
        dragTimerIdRef.current = null;
      }
    }
  }, [track.dndInfo.isDragging, trackRef]);

  useEffect(() => {
    updateTrackAnimation();
  }, [
    track.startTrimDuration,
    track.endTrimDuration,
    track.channel,
    track.startTime,
    updateTrackAnimation,
  ]);

  useEffect(() => {
    const updateTrackAnimationWithEvent = () => {
      updateTrackAnimation('event');
    };

    timeline.zoomController.addListener(updateTrackAnimationWithEvent);
    timeline.scrollController.addListener(updateTrackAnimationWithEvent);

    updateTrackAnimation();

    return () => {
      timeline.zoomController.removeListener(updateTrackAnimationWithEvent);
      timeline.scrollController.removeListener(updateTrackAnimationWithEvent);
    };
  }, [
    timeline.scrollController,
    timeline.zoomController,
    updateTrackAnimation,
  ]);

  return { isDragging, onMouseUp, onMouseDown };
};
