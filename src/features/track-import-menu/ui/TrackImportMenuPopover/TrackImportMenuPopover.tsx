'use client';

import { preventAll } from '@/shared/lib';
import { Popover, PopoverContent, ProgressBar } from '@/shared/ui';

import { TrackImportMenu } from '..';

import { TrackImportMenuPopoverProps } from './interfaces';

export const TrackImportMenuPopover = ({
  isFileUploading,
  onAddToNewChannel,
  onAddToTheEnd,
  onCancelUpload,
  ...props
}: TrackImportMenuPopoverProps) => {
  return (
    <Popover {...props}>
      <PopoverContent
        className='z-50 outline-none'
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
          <div className='flex flex-col gap-2 rounded-lg border border-accent bg-primary px-8 py-4'>
            <span className='text-center text-xs font-bold text-accent'>
              {'Uploading track'}
            </span>
            <ProgressBar value={null} />
          </div>
        ) : (
          <TrackImportMenu
            // ref={importMenuRef}
            onAddToTheEnd={onAddToTheEnd}
            onAddToNewChannel={onAddToNewChannel}
            onCancelUpload={onCancelUpload}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
