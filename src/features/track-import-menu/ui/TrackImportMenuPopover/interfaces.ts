import { PopoverProps } from '@/shared/ui';

import { TrackImportMenuProps } from '../TrackImportMenu';

export interface TrackImportMenuPopoverProps
  extends PopoverProps,
    Pick<
      TrackImportMenuProps,
      'onAddToTheEnd' | 'onAddToNewChannel' | 'onCancelUpload'
    > {
  isFileUploading: boolean;
}
