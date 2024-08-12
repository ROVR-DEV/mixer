'use client';

import { useRef } from 'react';
import { useOutsideClick } from 'rooks';

import { preventAll } from '@/shared/lib';
import { Popover, PopoverContent } from '@/shared/ui';

import { TrackImportMenu } from '..';

import { TrackImportMenuPopoverProps } from './interfaces';

export const TrackImportMenuPopover = ({
  isFileUploading,
  onClose,
  onAddToNewChannel,
  onAddToTheEnd,
  onReplaceExisting,
  ...props
}: TrackImportMenuPopoverProps) => {
  const importMenuRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(importMenuRef, onClose);

  return (
    <Popover {...props}>
      <PopoverContent
        className='z-50'
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        onClick={preventAll}
        onMouseDown={preventAll}
        onMouseUp={preventAll}
      >
        {isFileUploading ? (
          <div className='rounded-lg border border-accent bg-primary px-4 py-8'>
            {'Loading file'}
          </div>
        ) : (
          <TrackImportMenu
            ref={importMenuRef}
            onAddToTheEnd={onAddToTheEnd}
            onAddToNewChannel={onAddToNewChannel}
            onReplaceExisting={onReplaceExisting}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
