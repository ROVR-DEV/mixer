'use client';

import { cn } from '@/shared/lib';

import { TrackEditorLeftPane } from '../TrackEditorLeftPane';
import { TrackEditorRightPane } from '../TrackEditorRightPane';

import { TrackEditorProps } from './interfaces';

export const TrackEditor = ({ className, ...props }: TrackEditorProps) => {
  return (
    <div
      className={cn('flex bg-primary border-y border-y-third', className)}
      {...props}
    >
      <TrackEditorLeftPane className='w-[296px] min-w-[296px] max-w-[296px]' />
      <TrackEditorRightPane className='size-full' />
    </div>
  );
};
