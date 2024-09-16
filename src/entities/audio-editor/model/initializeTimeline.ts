import { Timeline, TimelineProps } from './timeline';

const store: Record<string, Timeline> = {};

export const initializeTimeline = (
  key: string,
  props: TimelineProps,
): Timeline => {
  const _store = store;

  const timeline = _store[key] ?? new Timeline(props);

  // For server side rendering always create a new store
  if (typeof window === 'undefined') {
    return timeline;
  }

  // Create the store once in the client
  if (!store[key]) {
    store[key] = timeline;
  }

  return timeline;
};
