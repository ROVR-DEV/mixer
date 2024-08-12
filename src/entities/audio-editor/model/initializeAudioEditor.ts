import { AudioEditor, ObservableAudioEditor } from './audioEditor';

let store: AudioEditor;

export const initializeAudioEditor = (): AudioEditor => {
  const _store = store ?? new ObservableAudioEditor();

  // For server side rendering always create a new store
  if (typeof window === 'undefined') {
    return _store;
  }

  // Create the store once in the client
  if (!store) {
    store = _store;
  }

  return _store;
};
