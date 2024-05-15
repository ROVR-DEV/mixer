/* eslint-disable sonarjs/no-duplicate-string */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useSize, cn } from '@/shared/lib';

import {
  AddNewChannelButtonMemoized,
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';
import { ClockRef } from '@/entities/clock';
import { GlobalControlsEvent, useGlobalControls } from '@/entities/event';
import { PlaylistInfoMemoized, getPlaylistMaxTime } from '@/entities/playlist';
import { Track, TrackWaveformCardMemoized, useTracks } from '@/entities/track';

import { AudioEditorFloatingToolbar } from '@/features/audio-editor-floating-toolbar';
import { ChannelControlMemoized } from '@/features/channel-control';
import {
  useTimelineProperties,
  TimelineRulerMemoized,
  TimelineRulerRef,
  TimelineGridRef,
  TimelineGridMemoized,
  Tick,
  useTicks,
  TimelinePlayHead,
  usePlayHeadMove,
  clampTime,
  TimelineScrollMemoized,
  TimelineScrollDivRef,
} from '@/features/timeline';

import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';

import { TimelineProps } from './interfaces';

const trackHeight = 96;
const rulerLeftPadding = 5;

export const AudioEditor = ({
  playlist,
  className,
  ...props
}: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const rulerRef = useRef<TimelineRulerRef | null>(null);
  const gridRef = useRef<TimelineGridRef | null>(null);
  const clockRef = useRef<ClockRef | null>(null);

  const playHeadRef = useRef<HTMLDivElement | null>(null);

  const horizontalScrollRef = useRef<TimelineScrollDivRef>(null);

  const [channels, setChannels] = useState<{ id: number }[]>([
    { id: 1 },
    { id: 2 },
  ]);
  const [selectedChannel, setSelectedChannel] = useState<{
    id: number;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const playingRef = useRef(isPlaying);

  const timeAnimationFrame = useRef<number>(0);

  const size = useSize(containerRef);
  const timelineClientWidth = size?.width ?? 0;
  const paddingTimeSeconds = 120;

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const [soloChannelIds, setSoloChannelIds] = useState<number[]>([]);
  const [mutedChannelIds, setMutedChannelIds] = useState<number[]>([]);

  const tracksBuffers = useRef<{
    [key: number]: WaveSurfer;
  }>({});

  const onAppendTrackBuffer = (trackId: number, trackBuffer: WaveSurfer) =>
    (tracksBuffers.current = {
      ...tracksBuffers.current,
      [trackId]: trackBuffer,
    });

  const playlistTotalTime = useMemo(
    () => getPlaylistMaxTime(playlist),
    [playlist],
  );
  const { tracks, loadedTracksCount } = useTracks(playlist);
  const isReady = tracks !== null;

  const handleShiftChange = useCallback((newShift: number) => {
    horizontalScrollRef.current?.setScroll(newShift);
  }, []);

  const { zoom, shift, setShift, pixelsPerSecond, timelineScrollWidth } =
    useTimelineProperties(
      timelineRef,
      containerRef,
      timelineClientWidth,
      playlistTotalTime,
      50,
      paddingTimeSeconds,
      handleShiftChange,
    );

  const setAllShift = useCallback(
    (newShift: number) => {
      setShift(newShift);
      handleShiftChange(newShift);
    },
    [handleShiftChange, setShift],
  );

  const ticks = useTicks(timelineClientWidth, zoom, shift * pixelsPerSecond);

  const addNewChannel = useCallback(() => {
    setChannels((prevState) => [
      ...prevState,
      { id: (prevState.at(-1)?.id ?? 1) + 1 },
    ]);
  }, []);

  const toggleChannelMute = (channelId: number, includes?: boolean) => {
    setMutedChannelIds((prevState) => {
      if (includes || prevState.includes(channelId)) {
        return prevState.filter((id) => id !== channelId);
      }

      return [...prevState, channelId];
    });
  };

  const toggleChannelSolo = (channelId: number, includes?: boolean) => {
    setSoloChannelIds((prevState) => {
      if (includes || prevState.includes(channelId)) {
        return prevState.filter((id) => id !== channelId);
      }

      return [...prevState, channelId];
    });
  };

  const handleMuteChannel = useCallback(
    (trackId: number) => {
      if (soloChannelIds.includes(trackId)) {
        toggleChannelSolo(trackId, true);
      }

      toggleChannelMute(trackId);
    },
    [soloChannelIds],
  );

  const handleSoloChannel = useCallback(
    (trackId: number) => {
      if (mutedChannelIds.includes(trackId)) {
        toggleChannelMute(trackId, true);
      }

      toggleChannelSolo(trackId);
    },
    [mutedChannelIds],
  );

  const channelNodes = useMemo(
    () =>
      channels.map((channel) => {
        const isSolo = soloChannelIds.includes(channel.id);

        return (
          <ChannelListItemMemoized
            style={{ height: trackHeight }}
            key={`${channel.id}-channel`}
            isSelected={selectedChannel?.id === channel.id}
            onClick={() => setSelectedChannel(channel)}
          >
            <ChannelControlMemoized
              number={channel.id}
              isSelected={selectedChannel?.id === channel.id}
              isAbleToRemove={channel.id > 2}
              isMuted={
                (mutedChannelIds.includes(channel.id) && !isSolo) ||
                (!!soloChannelIds.length && !isSolo)
              }
              isSolo={isSolo}
              onClickMute={(e) => {
                e.stopPropagation();
                handleMuteChannel(channel.id);
              }}
              onClickSolo={(e) => {
                e.stopPropagation();
                handleSoloChannel(channel.id);
              }}
              onClickRemove={(e) => {
                e.stopPropagation();
                setChannels((prevState) => [
                  ...prevState.slice(0, prevState.length - 1),
                ]);
              }}
              onClickAutomation={(e) => e.stopPropagation()}
            />
          </ChannelListItemMemoized>
        );
      }),
    [
      channels,
      handleMuteChannel,
      handleSoloChannel,
      mutedChannelIds,
      selectedChannel?.id,
      soloChannelIds,
    ],
  );

  const trackRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const trackMapFunction = useCallback(
    (track: Track, channelId?: number) => {
      const durationInSeconds = track.end - track.start;

      const trackStartPosition = track.start * pixelsPerSecond;
      const trackEndPosition = track.end * pixelsPerSecond;

      const shiftPixels = shift * pixelsPerSecond;

      const shiftFromLeft = rulerLeftPadding + trackStartPosition - shiftPixels;
      const trackWidth = durationInSeconds * pixelsPerSecond;

      const isVisible =
        trackStartPosition < timelineClientWidth + shiftPixels &&
        trackEndPosition > shiftPixels;

      const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedTrack(track);
        if (channelId) {
          setSelectedChannel({ id: channelId });
        }
      };

      const isSolo = channelId ? soloChannelIds.includes(channelId) : false;

      if (trackRefs.current.has(track.uuid)) {
        const ref = trackRefs.current.get(track.uuid);
        if (ref) {
          const valueNowString = ref.getAttribute('aria-valuenow');
          if (!valueNowString) {
            ref.setAttribute(
              'aria-valuenow',
              (shiftFromLeft + rulerLeftPadding).toString(),
            );
          }
          ref.style.left = `${Number(ref.getAttribute('aria-valuenow')) - shiftPixels}px`;
        }
      }

      const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const valueNowString = e.currentTarget.getAttribute('aria-valuenow');
        if (!valueNowString) {
          e.currentTarget.setAttribute(
            'aria-valuenow',
            shiftFromLeft.toString(),
          );
        }

        e.currentTarget.dataset.dragStartX = e.nativeEvent.offsetX.toString();
        if (!e.currentTarget.dataset.startAriaValueNow) {
          e.currentTarget.dataset.startAriaValueNow =
            e.currentTarget.getAttribute('aria-valuenow') ?? '';
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
        const canvas = document.createElement('canvas');
        e.dataTransfer.setDragImage(canvas, 0, 0);
        canvas.remove();
      };

      const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        const newValue =
          e.nativeEvent.pageX -
          Number(e.currentTarget.dataset.dragStartX) -
          296;

        if (newValue < Number(e.currentTarget.getAttribute('aria-valuemin'))) {
          return;
        }

        e.currentTarget.style.left = `${newValue - shiftPixels}px`;
        e.currentTarget.setAttribute('aria-valuenow', newValue.toString());
      };

      const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.dataset.startAriaValueNow = '';
      };

      return (
        <TrackWaveformCardMemoized
          className='absolute'
          ref={(r) => {
            trackRefs.current.set(track.uuid, r);
          }}
          aria-valuemin={0}
          key={track.uuid}
          track={track}
          trackData={tracks?.[track.uuid]}
          style={{
            display: isVisible ? '' : 'none',
            width: trackWidth,
            left: shiftFromLeft,
          }}
          draggable
          onDragOver={(e) => e.preventDefault()}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          isSolo={isSolo}
          onAddTrackBuffer={onAppendTrackBuffer}
          isSelected={selectedTrack?.uuid === track.uuid}
          onClick={handleClick}
          onMouseUp={(e) => e.stopPropagation()}
        />
      );
    },
    [
      pixelsPerSecond,
      selectedTrack?.uuid,
      shift,
      soloChannelIds,
      timelineClientWidth,
      tracks,
    ],
  );

  const { evenTracks, oddTracks, evenTrackNodes, oddTracksNodes } =
    useMemo(() => {
      const evenTracks = playlist.tracks.filter((_, i) => i % 2 === 0);
      const oddTracks = playlist.tracks.filter((_, i) => i % 2 !== 0);

      return {
        evenTracks,
        oddTracks,
        evenTrackNodes: evenTracks.map((track) => trackMapFunction(track, 2)),
        oddTracksNodes: oddTracks.map((track) => trackMapFunction(track, 1)),
      };
    }, [playlist.tracks, trackMapFunction]);

  const trackNodes = useMemo(
    () =>
      channels.map((channel) => {
        const isSolo = soloChannelIds.includes(channel.id);

        return (
          <ChannelListItemMemoized
            key={`${channel.id}-track`}
            className='relative'
            isSelected={selectedChannel?.id === channel.id}
            isMuted={
              (mutedChannelIds.includes(channel.id) && !isSolo) ||
              (!!soloChannelIds.length && !isSolo)
            }
            onClick={() => setSelectedChannel(channel)}
          >
            {channel.id === 1
              ? oddTracksNodes
              : channel.id === 2
                ? evenTrackNodes
                : null}
          </ChannelListItemMemoized>
        );
      }),
    [
      channels,
      evenTrackNodes,
      mutedChannelIds,
      oddTracksNodes,
      selectedChannel?.id,
      soloChannelIds,
    ],
  );

  const time = useRef<number>(0);
  const startRef = useRef<number | undefined>(undefined);
  const prevRef = useRef<number>(0);

  const getIntersectingByTimeTracks = useCallback(
    (time: number) =>
      playlist.tracks.filter(({ start, end }) => time >= start && time < end),
    [playlist.tracks],
  );

  const getTrackBuffer = (trackId: number) => tracksBuffers.current[trackId];

  const updateTrackBuffers = useCallback(() => {
    if (!isReady) {
      return;
    }

    const tracks = getIntersectingByTimeTracks(time.current);

    const mutedTrackIds = mutedChannelIds.reduce<number[]>((acc, channelId) => {
      if (channelId === 1) {
        return [...acc, ...oddTracks.map((track) => track.id)];
      } else if (channelId === 2) {
        return [...acc, ...evenTracks.map((track) => track.id)];
      } else {
        return acc;
      }
    }, [] as number[]);

    const soloTrackIds = soloChannelIds.reduce<number[]>((acc, channelId) => {
      if (channelId === 1) {
        return [...acc, ...oddTracks.map((track) => track.id)];
      } else if (channelId === 2) {
        return [...acc, ...evenTracks.map((track) => track.id)];
      } else {
        return acc;
      }
    }, [] as number[]);

    // TODO: тут надо как-то оптимизировать это, жесткая долбёжка: https://www.youtube.com/watch?v=szMd_uh8xtc
    if (isPlaying && tracks.length > 0) {
      tracks.forEach(({ id }) => {
        const trackBuffer = getTrackBuffer(id);

        const isMuted = mutedTrackIds.includes(id);

        const hasAtLeastOneSolo = !!soloChannelIds.length;
        const isSolo = soloTrackIds.includes(id);

        if (trackBuffer) {
          if (isMuted || (hasAtLeastOneSolo && !isSolo)) {
            trackBuffer.pause();
          } else if (isSolo || !trackBuffer.isPlaying()) {
            trackBuffer.play();
          }
        }
      });
    }
  }, [
    evenTracks,
    getIntersectingByTimeTracks,
    isPlaying,
    isReady,
    mutedChannelIds,
    oddTracks,
    soloChannelIds,
  ]);

  const realToVirtualPixels = useCallback(
    (value: number) => {
      return value * pixelsPerSecond;
    },
    [pixelsPerSecond],
  );

  const getPlayHeadPosition = useCallback(() => {
    return (
      realToVirtualPixels(time.current) -
      realToVirtualPixels(shift) +
      rulerLeftPadding
    );
  }, [realToVirtualPixels, shift]);

  const setViewToPlayHead = useCallback(
    (timelineClientWidth: number, shift: number, pixelsPerSecond: number) => {
      const playHeadVirtualPosition =
        realToVirtualPixels(time.current) + rulerLeftPadding;
      const virtualShift = realToVirtualPixels(shift);

      if (
        playHeadVirtualPosition < virtualShift ||
        playHeadVirtualPosition >= timelineClientWidth + virtualShift
      ) {
        setAllShift(playHeadVirtualPosition / pixelsPerSecond);
      }
    },
    [realToVirtualPixels, setAllShift],
  );

  const updatePlayHead = useCallback(() => {
    const playHead = playHeadRef.current;
    if (!playHead) {
      return;
    }

    const newPosition = getPlayHeadPosition();

    playHead.style.left = `${newPosition}px`;

    if (playingRef.current) {
      setViewToPlayHead(timelineClientWidth, shift, pixelsPerSecond);
    }

    playHead.style.display =
      newPosition < 0 || newPosition > timelineClientWidth ? 'none' : '';
  }, [
    getPlayHeadPosition,
    pixelsPerSecond,
    setViewToPlayHead,
    shift,
    timelineClientWidth,
  ]);

  const updateClock = () => {
    clockRef.current?.updateTime(time.current);
  };

  const updatePlayHeadAndTime = useCallback(() => {
    updateTrackBuffers();
    updatePlayHead();
    updateClock();
  }, [updatePlayHead, updateTrackBuffers]);

  const animatePlayHead = useCallback(
    (timeStamp: number) => {
      const playing = playingRef.current;

      if (!playing) {
        startRef.current = undefined;
        prevRef.current = 0;
        return;
      }

      if (startRef.current === undefined) {
        startRef.current = timeStamp;
        prevRef.current = timeStamp;
      }

      time.current += 1 * ((timeStamp - prevRef.current) / 1000);

      updatePlayHeadAndTime();

      prevRef.current = timeStamp;
      timeAnimationFrame.current = requestAnimationFrame(animatePlayHead);
    },
    [updatePlayHeadAndTime],
  );

  const handlePlay = useCallback(() => {
    if (!isReady) {
      return;
    }

    setIsPlaying(true);
    playingRef.current = true;

    const tracks = getIntersectingByTimeTracks(time.current);

    if (tracks.length === 0) {
      return;
    }

    tracks.forEach(({ start, end, id }) => {
      const trackSeekPercent = (time.current - start) / (end - start);

      const trackBuffer = getTrackBuffer(id);
      if (trackBuffer) {
        trackBuffer.seekTo(trackSeekPercent);
        trackBuffer.play();
      }
    });
  }, [getIntersectingByTimeTracks, isReady]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    playingRef.current = false;
    startRef.current = undefined;

    const tracks = Object.values(tracksBuffers.current);

    if (tracks.length === 0) {
      return;
    }

    tracks.forEach((track) => track.pause());
  }, []);

  const renderRuler = (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    shift: number,
    ticksStartPadding: number,
    zoom: number,
  ) =>
    requestAnimationFrame(() => {
      rulerRef.current?.render(
        ticks,
        shift,
        ticksStartPadding,
        zoom,
        '#9B9B9B',
      );
    });

  const renderGrid = (
    ticks: { mainTicks: Tick[]; subTicks: Tick[] },
    shift: number,
    ticksStartPadding: number,
  ) =>
    requestAnimationFrame(() => {
      gridRef.current?.render(
        ticks,
        shift,
        ticksStartPadding,
        '#555555',
        '#2D2D2D',
      );
    });

  const handleMouseMovePlayHead = useCallback(
    (e: MouseEvent) => {
      time.current = clampTime(
        (e.pageX - rulerLeftPadding - 294) / pixelsPerSecond + shift,
      );

      requestAnimationFrame(updatePlayHeadAndTime);
    },
    [pixelsPerSecond, shift, updatePlayHeadAndTime],
  );

  const handleClickPlayHead = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      time.current = clampTime(
        (e.pageX - rulerLeftPadding - 294) / pixelsPerSecond + shift,
      );

      if (isPlaying) {
        handleStop();
        handlePlay();
      } else {
        handleStop();
      }

      const tracksIds = {
        filled: [] as number[],
        empty: [] as number[],
      };

      playlist.tracks.forEach(({ start, end, id }) => {
        if (start >= time.current) {
          tracksIds.empty.push(id);
        } else if (time.current >= end) {
          tracksIds.filled.push(id);
        }
      });

      tracksIds.filled.forEach((id) => {
        const trackBuffer = getTrackBuffer(id);

        if (trackBuffer) {
          trackBuffer.seekTo(1);
        }
      });

      tracksIds.empty.forEach((id) => {
        const trackBuffer = getTrackBuffer(id);

        if (trackBuffer) {
          trackBuffer.seekTo(0);
        }
      });

      updatePlayHeadAndTime();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pixelsPerSecond, shift, updatePlayHeadAndTime, isPlaying, playlist.tracks],
  );

  const handleGlobalControls = (event: GlobalControlsEvent) => {
    if (event.type === 'Play/Pause') {
      if (isPlaying) {
        handleStop();
      } else {
        handlePlay();
      }
    }
  };

  const handleClickTimeline = () => {
    setSelectedTrack(null);
  };

  const handleHorizontalScrollbarOnScroll = (
    e: React.UIEvent<HTMLDivElement>,
  ) => {
    setShift(e.currentTarget.scrollLeft);
  };

  useEffect(() => {
    const animationId = requestAnimationFrame(animatePlayHead);
    timeAnimationFrame.current = animationId;

    if (!isPlaying) {
      window.cancelAnimationFrame(animationId);
      window.cancelAnimationFrame(timeAnimationFrame.current);
    }

    return () => {
      window.cancelAnimationFrame(animationId);
      window.cancelAnimationFrame(timeAnimationFrame.current);
    };
  }, [animatePlayHead, isPlaying]);

  useEffect(() => {
    updatePlayHeadAndTime();
  }, [updatePlayHeadAndTime]);

  useEffect(() => {
    renderRuler(ticks, shift * pixelsPerSecond, rulerLeftPadding, zoom);
  }, [ticks, channels, timelineClientWidth, shift, pixelsPerSecond, zoom]);

  useEffect(() => {
    renderGrid(ticks, shift * pixelsPerSecond, rulerLeftPadding);
  }, [
    ticks,
    channels,
    timelineClientWidth,
    shift,
    pixelsPerSecond,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.keys(tracks ?? {}),
  ]);

  usePlayHeadMove(handleMouseMovePlayHead, containerRef);
  useGlobalControls(handleGlobalControls);

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <AudioEditorHeaderMemoized
        className='border-b border-b-secondary px-6 py-3'
        clockRef={clockRef}
        onPlay={handlePlay}
        onStop={handleStop}
        playing={isPlaying}
        selectedTrack={selectedTrack}
      />
      <div className='relative flex h-full grow flex-col overflow-hidden'>
        <div className='flex'>
          <div className='pointer-events-none absolute left-[296px] z-10 h-full'>
            <TimelinePlayHead
              ref={playHeadRef}
              style={{ left: rulerLeftPadding }}
            />
          </div>
          <ChannelListMemoized className='min-w-[296px]'>
            <ChannelListItemMemoized
              className='h-[72px] items-start'
              disableBorder
            >
              <PlaylistInfoMemoized
                totalPlaytime={playlistTotalTime}
                tracksCount={playlist.tracks.length}
              />
            </ChannelListItemMemoized>
          </ChannelListMemoized>
          <div
            className='relative flex w-full items-end pb-[9px]'
            onClick={handleClickPlayHead}
            ref={containerRef}
          >
            <TimelineRulerMemoized className='h-[32px] w-full' ref={rulerRef} />
          </div>
        </div>
        <hr className='border-secondary' />
        <div className='flex h-full grow overflow-y-auto overflow-x-hidden'>
          <ChannelListMemoized className='min-h-max min-w-[296px] grow'>
            {channelNodes}
            <ChannelListItemMemoized
              className='justify-center'
              disableBorder
              style={{ height: trackHeight }}
            >
              <AddNewChannelButtonMemoized onClick={addNewChannel} />
            </ChannelListItemMemoized>
          </ChannelListMemoized>

          <div
            className='relative min-h-max w-full grow overflow-x-clip'
            ref={timelineRef}
            onMouseUp={handleClickPlayHead}
            onClick={handleClickTimeline}
          >
            {tracks === null ? (
              <span className='flex size-full flex-col items-center justify-center'>
                <span>{'Loading...'}</span>
                <span>{`${loadedTracksCount} / ${playlist.tracks.length}`}</span>
              </span>
            ) : (
              <>
                <TimelineGridMemoized
                  className='absolute w-full'
                  style={{ height: channels.length * trackHeight }}
                  ref={gridRef}
                />
                {trackNodes}
              </>
            )}
            <AudioEditorFloatingToolbar className='absolute inset-x-0 bottom-[40px] z-10 mx-auto flex w-max' />
          </div>
        </div>
      </div>
      <div className='grid grow grid-cols-[296px_auto]'>
        <TimelineScrollMemoized
          className='col-start-2'
          scrollDivRef={horizontalScrollRef}
          timelineScrollWidth={timelineScrollWidth}
          xPadding={4}
          scrollDivProps={{
            onScroll: handleHorizontalScrollbarOnScroll,
          }}
        />
      </div>
    </div>
  );
};
