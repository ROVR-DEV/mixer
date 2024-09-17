import { preventAll } from '@/shared/lib';
import { Dialog, DialogContent, ProgressBar } from '@/shared/ui';

import { TrackImportMenu } from '..';

import { TrackImportMenuPopoverProps } from './interfaces';

export const TrackImportMenuDialog = ({
  isFileUploading,
  onAddToNewChannel,
  onAddToTheEnd,
  onCancelUpload,
  ...props
}: TrackImportMenuPopoverProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        className='z-50 outline-none'
        onClick={preventAll}
        onMouseDown={preventAll}
        onMouseUp={preventAll}
      >
        {isFileUploading ? (
          <div className='flex flex-col gap-2 rounded-lg border border-accent bg-primary px-8 py-4'>
            <span className='py-1 text-center text-xs font-bold text-accent'>
              {'Uploading track'}
            </span>
            <ProgressBar className='border border-accent' value={null} />
          </div>
        ) : (
          <TrackImportMenu
            onAddToTheEnd={onAddToTheEnd}
            onAddToNewChannel={onAddToNewChannel}
            onCancelUpload={onCancelUpload}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
