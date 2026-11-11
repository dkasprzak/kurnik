import { emptyAppState, type AppState } from './domain';

/** Loads and saves the whole app state. */
export interface AppStorage {
  load(): AppState;
  save(state: AppState): void;
}

export const STORAGE_KEY = 'kury:v1';

/** Browser localStorage, the default for the real app. */
export function createLocalStorage(key: string = STORAGE_KEY): AppStorage {
  return {
    load: () => {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return emptyAppState();
        return { ...emptyAppState(), ...(JSON.parse(raw) as Partial<AppState>) };
      } catch {
        return emptyAppState();
      }
    },
    save: (state) => {
      window.localStorage.setItem(key, JSON.stringify(state));
    },
  };
}

/** In-memory storage, used by tests. */
export function createMemoryStorage(initial: AppState = emptyAppState()): AppStorage {
  let snapshot = JSON.stringify(initial);
  return {
    load: () => JSON.parse(snapshot) as AppState,
    save: (state) => {
      snapshot = JSON.stringify(state);
    },
  };
}
