/**
 * Pure domain module (no React). Vocabulary follows GLOSSARY.md.
 */

export type Flock = {
  hens: number;
  roosters: number;
};

/** Birds counted in the coop at the evening Closing. */
export type Closing = {
  hens: number;
  roosters: number;
};

/** Local calendar date as YYYY-MM-DD. */
export type DateKey = string;

/** The local calendar date of a moment, as YYYY-MM-DD. */
export function toDateKey(date: Date): DateKey {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight of a YYYY-MM-DD date. */
export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type DayEntry = {
  /** Snapshot of the Flock taken when the entry was first created. */
  flock: Flock;
  closing?: Closing;
  eggCount?: number;
};

export type AppState = {
  /** Absent until the keeper completes the Flock setup. */
  flock?: Flock;
  dayEntries: Record<DateKey, DayEntry>;
};

export type FlockError = 'invalid-count' | 'empty';

/** Returns why a Flock cannot be saved, or undefined if it is valid. */
export function validateFlock(flock: Flock): FlockError | undefined {
  const isCount = (n: number) => Number.isInteger(n) && n >= 0;
  if (!isCount(flock.hens) || !isCount(flock.roosters)) return 'invalid-count';
  if (flock.hens + flock.roosters === 0) return 'empty';
  return undefined;
}

export const emptyAppState = (): AppState => ({ dayEntries: {} });
