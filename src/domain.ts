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

/**
 * The Day Entry for a date, or a new one holding a snapshot of the current Flock.
 * A new entry is not stored until the caller saves a state containing it.
 */
export function getOrCreateDayEntry(state: AppState, date: DateKey): DayEntry {
  const existing = state.dayEntries[date];
  if (existing) return existing;
  if (!state.flock) throw new Error('Cannot create a Day Entry before the Flock is set up');
  return { flock: { ...state.flock } };
}

/** Saves (or replaces) the Closing of a day, creating its Day Entry if needed. Never changes the Flock. */
export function saveClosing(state: AppState, date: DateKey, closing: Closing): AppState {
  const entry = getOrCreateDayEntry(state, date);
  return {
    ...state,
    dayEntries: { ...state.dayEntries, [date]: { ...entry, closing: { ...closing } } },
  };
}

/** Birds missing at Closing, per bird type. */
export type Shortfall = {
  hens: number;
  roosters: number;
};

/** max(0, flock − counted) per bird type. */
export function shortfallOf(flock: Flock, closing: Closing): Shortfall {
  return {
    hens: Math.max(0, flock.hens - closing.hens),
    roosters: Math.max(0, flock.roosters - closing.roosters),
  };
}

/** True when no bird is missing ("all in"). */
export function isAllIn(shortfall: Shortfall): boolean {
  return shortfall.hens === 0 && shortfall.roosters === 0;
}
