import { MutableRefObject } from 'react';
// @ts-expect-error there is no type for this lib
import useContainerQuery from 'use-container-query';

export const useContainer = (
  ref: MutableRefObject<HTMLElement | null>,
  size: number,
) => {
  return useContainerQuery(ref, {
    type: 'min-width',
    value: size,
  });
};
