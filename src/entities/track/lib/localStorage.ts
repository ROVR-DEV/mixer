export const isTrackCachingEnabled = () =>
  !!localStorage.getItem('cacheTracks');

export const enableTrackCaching = () =>
  localStorage.setItem('cacheTracks', 'true');

export const disableTrackCaching = () => localStorage.removeItem('cacheTracks');

export const toggleTrackCaching = () => {
  if (isTrackCachingEnabled()) {
    disableTrackCaching();
  } else {
    enableTrackCaching();
  }
};
