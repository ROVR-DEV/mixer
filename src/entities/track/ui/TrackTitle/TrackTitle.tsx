'use client';

import React, { useEffect, useMemo, useRef } from 'react';

import { cn, stopPropagation } from '@/shared/lib';

import { getDurationDisplayText } from '../../lib';
import { EditInput } from '../EditInput';

import { TrackTitleProps } from './interfaces';

export const TrackTitle = ({
  track,
  isEditing,
  onEdited,
  className,
  ...props
}: TrackTitleProps) => {
  const trackTitleArtist = useMemo(
    () => (track ? `${track.title} | ${track.artist}` : 'No track selected'),
    [track],
  );

  const trackDuration = useMemo(
    () => `(${getDurationDisplayText(track ? track.end - track.start : 0)})`,
    [track],
  );

  const titleRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString();
    const artist = formData.get('artist')?.toString();

    onEdited?.(title, artist);
  };

  useEffect(() => {
    if (isEditing) {
      const timerId = setTimeout(() => {
        titleRef.current?.focus();
        titleRef.current?.select();
      }, 100);

      return () => clearTimeout(timerId);
    }
  }, [isEditing]);

  return (
    <span
      className={cn(
        'overflow-hidden text-ellipsis text-nowrap text-[12px]',
        className,
      )}
      {...props}
    >
      {isEditing ? (
        <form
          className='inline-flex gap-1'
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
          onSubmit={onSubmit}
          onKeyDown={stopPropagation}
        >
          <EditInput
            ref={titleRef}
            className='font-bold'
            name='title'
            placeholder='Title'
            maxLength={255}
            defaultValue={track?.title ?? ''}
          />
          <EditInput
            className='font-bold'
            name='artist'
            placeholder='Artist'
            maxLength={255}
            defaultValue={track?.artist ?? ''}
          />
          <input type='submit' hidden />
        </form>
      ) : (
        <span className='font-bold'>{trackTitleArtist}</span>
      )}
      <span> </span>
      <span>{trackDuration}</span>
    </span>
  );
};
