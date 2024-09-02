import { useCallback } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className='flex flex-col rounded-lg border border-accent bg-primary px-4 py-3 text-third-light'>
        <DialogHeading>{'Remove channel'}</DialogHeading>
        <DialogDescription>
          <p>{`Are you sure you want to remove channel ${formatChannelNumber(number)}?`}</p>
        </DialogDescription>
        <div className='mt-2 flex justify-end gap-2 text-[13px]'>
          <Button className='w-20 bg-error p-1.5 uppercase' onClick={onRemove}>
            {'Remove'}
          </Button>
          <Button className='w-20 p-1.5 uppercase' onClick={handleClose}>
            {'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
