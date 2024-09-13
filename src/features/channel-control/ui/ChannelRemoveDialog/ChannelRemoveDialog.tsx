import { useCallback } from 'react';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeading,
} from '@/shared/ui';

import { formatChannelNumber } from '@/entities/channel';

import { ChannelRemoveDialogProps } from './interfaces';

export const ChannelRemoveDialog = ({
  number,
  onRemove,
  onOpenChange,
  ...props
}: ChannelRemoveDialogProps) => {
  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className='flex w-96 flex-col rounded-lg border border-accent bg-primary px-4 py-3 text-third-light outline-none'>
        <DialogHeading>{'Remove channel'}</DialogHeading>
        <DialogDescription>
          <p>{`Are you sure you want to remove channel ${formatChannelNumber(number)}?`}</p>
        </DialogDescription>
        <DialogFooter>
          <div className='mt-2 flex justify-end gap-2 text-[13px]'>
            <Button
              className='w-20 bg-error p-1.5 uppercase'
              onClick={onRemove}
            >
              {'Remove'}
            </Button>
          </div>
        </DialogFooter>
        <DialogClose onClick={handleClose} />
      </DialogContent>
    </Dialog>
  );
};
