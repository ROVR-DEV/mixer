'use client';

import { DependencyList, useEffect, useMemo } from 'react';

export const useListener = <T>(
  addFun: (handler: T) => void,
  removeFun: (handler: T) => void,
  handler: T,
  deps?: DependencyList,
) => {
  const newDeps = useMemo(
    () => [addFun, handler, removeFun, ...(deps ?? [])],
    [addFun, deps, handler, removeFun],
  );

  useEffect(() => {
    addFun(handler);
    return () => removeFun(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, newDeps);
};
