import { applyChange, emptyAppState, type AppState, type StateChange } from './domain';

/** The Household data: a live view of the whole state plus granular writes. */
export interface AppStorage {
  /**
   * Calls the listener with the current state once it is available, then again after
   * every change (local or made by another Keeper). Returns an unsubscribe function.
   */
  subscribe(listener: (state: AppState) => void): () => void;
  /** Persists only the fields named in the change, merging them into what is stored. */
  write(change: StateChange): void;
}

export type MemoryStorage = AppStorage & {
  /** The stored state right now (for test assertions and simulated other-Keeper writes). */
  current(): AppState;
  /** Delivers the state to subscribers that are still waiting for it (see `deliverInitial`). */
  deliver(): void;
};

export type MemoryStorageOptions = {
  /** When false, subscribers wait for `deliver()` before the first state (simulates loading). */
  deliverInitial?: boolean;
};

/** In-memory storage, used by tests. */
export function createMemoryStorage(
  initial: AppState = emptyAppState(),
  { deliverInitial = true }: MemoryStorageOptions = {},
): MemoryStorage {
  let snapshot = JSON.stringify(initial);
  let delivered = deliverInitial;
  const listeners = new Set<(state: AppState) => void>();
  const current = () => JSON.parse(snapshot) as AppState;
  const notify = () => {
    if (delivered) listeners.forEach((listener) => listener(current()));
  };

  return {
    current,
    subscribe(listener) {
      listeners.add(listener);
      if (delivered) listener(current());
      return () => {
        listeners.delete(listener);
      };
    },
    write(change) {
      snapshot = JSON.stringify(applyChange(current(), change));
      notify();
    },
    deliver() {
      delivered = true;
      notify();
    },
  };
}
