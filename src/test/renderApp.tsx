import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import type { Clock } from '../clock';
import { createMemoryStorage, type MemoryStorage } from '../storage';
import { createFakeAuth, type FakeAuth } from './fakeAuth';

export type RenderAppOptions = {
  /** Local calendar date the injected clock reports as "today", as YYYY-MM-DD. */
  today?: string;
  /** Reuse a storage instance (e.g. to simulate reopening the app). */
  storage?: MemoryStorage;
  /** Start with the Keeper already signed in (ignored when `auth` is given). */
  signedIn?: boolean;
  /** Reuse an auth instance (e.g. to simulate reopening the app with a persisted session). */
  auth?: FakeAuth;
};

/** Builds a fake clock that always reports noon local time on the given date. */
export function fixedClock(isoDate: string): Clock {
  const [year, month, day] = isoDate.split('-').map(Number);
  return () => new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Mounts the whole <App> with a fake clock, in-memory storage (for any account) and fake auth (signed out by default).
 * Returns the storage and auth so a test can unmount and remount with the same data and session.
 */
export function renderApp({
  today = '2026-11-11',
  storage = createMemoryStorage(),
  signedIn = false,
  auth = createFakeAuth({ signedIn }),
}: RenderAppOptions = {}) {
  const user = userEvent.setup();
  const result = render(<App clock={fixedClock(today)} openStorage={() => storage} auth={auth} />);
  return { ...result, user, storage, auth };
}
