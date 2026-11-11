import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import type { Clock } from '../clock';
import { createMemoryStorage, type AppStorage } from '../storage';

export type RenderAppOptions = {
  /** Local calendar date the injected clock reports as "today", as YYYY-MM-DD. */
  today?: string;
  /** Reuse a storage instance (e.g. to simulate reopening the app). */
  storage?: AppStorage;
};

/** Builds a fake clock that always reports noon local time on the given date. */
export function fixedClock(isoDate: string): Clock {
  const [year, month, day] = isoDate.split('-').map(Number);
  return () => new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Mounts the whole <App> with a fake clock and in-memory storage.
 * Returns the storage so a test can unmount and remount with the same data.
 */
export function renderApp({ today = '2026-11-11', storage = createMemoryStorage() }: RenderAppOptions = {}) {
  const user = userEvent.setup();
  const result = render(<App clock={fixedClock(today)} storage={storage} />);
  return { ...result, user, storage };
}
