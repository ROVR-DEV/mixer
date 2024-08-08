import { DraggableCoreProps } from 'react-draggable';

import { CustomDragEventHandler, PartialBy } from '@/shared/model';

export interface CustomDraggableProps
  extends Omit<
    PartialBy<
      DraggableCoreProps,
      | 'allowAnyClick'
      | 'disabled'
      | 'enableUserSelectHack'
      | 'offsetParent'
      | 'grid'
      | 'scale'
    >,
    'onStart' | 'onDrag' | 'onStop'
  > {
  onStart: CustomDragEventHandler;
  onDrag: CustomDragEventHandler;
  onStop: CustomDragEventHandler;
}
