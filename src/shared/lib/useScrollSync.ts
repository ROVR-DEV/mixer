'use client';

import { RefObject, useEffect } from 'react';

const setScroll = (refA: HTMLElement, refB: HTMLElement) => {
  refA.scrollTop = refB.scrollTop;
};

export const useScrollSync = (refsToSync: RefObject<HTMLElement>[]) => {
  useEffect(() => {
    const onScroll = (e: Event) => {
      refsToSync.forEach((r) => {
        if (!r.current) {
          return;
        }

        setScroll(r.current, e.currentTarget as HTMLElement);
      });
    };

    refsToSync.forEach((ref) =>
      ref.current?.addEventListener('scroll', onScroll),
    );

    return () =>
      refsToSync.forEach((ref) =>
        ref.current?.removeEventListener('scroll', onScroll),
      );
  }, [refsToSync]);
};
