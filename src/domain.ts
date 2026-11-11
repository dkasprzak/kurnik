/**
 * Pure domain module (no React). Vocabulary follows GLOSSARY.md.
 */

/** A number of birds per bird type. */
export type BirdCounts = {
  hens: number;
  roosters: number;
};

/** The birds the keeper owns. */
export type Flock = BirdCounts;

/** Birds counted in the coop at the evening Closing. */
export type Closing = BirdCounts;

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

/** Fields to merge into one Day Entry; fields left out are kept as stored. */
export type DayEntryPatch = Partial<DayEntry>;

/**
 * A granular write to the Household data, decided by the domain: only the fields
 * listed here change, so two Keepers editing different fields never overwrite each other.
 */
export type StateChange = {
  flock?: Flock;
  dayEntries?: Record<DateKey, DayEntryPatch>;
};

/** Merges a change into the state (what every storage does when persisting it). */
export function applyChange(state: AppState, change: StateChange): AppState {
  const dayEntries = { ...state.dayEntries };
  for (const [date, patch] of Object.entries(change.dayEntries ?? {})) {
    dayEntries[date] = { ...dayEntries[date], ...patch } as DayEntry;
  }
  return { flock: change.flock ?? state.flock, dayEntries };
}

/**
 * Replaces the Flock. Today's Day Entry (if any) takes the new Flock as its
 * snapshot; past Day Entries keep theirs.
 */
export function flockChange(state: AppState, today: DateKey, flock: Flock): StateChange {
  if (!state.dayEntries[today]) return { flock: { ...flock } };
  return { flock: { ...flock }, dayEntries: { [today]: { flock: { ...flock } } } };
}

/**
 * Sets fields of a day's Day Entry; when the entry does not exist yet it is
 * created with a snapshot of the current Flock. Requires the Flock to be set up.
 */
function dayEntryChange(state: AppState, date: DateKey, patch: DayEntryPatch): StateChange {
  if (state.dayEntries[date]) return { dayEntries: { [date]: patch } };
  if (!state.flock) throw new Error('Cannot create a Day Entry before the Flock is set up');
  return { dayEntries: { [date]: { flock: { ...state.flock }, ...patch } } };
}

/** Saves (or replaces) the Closing of a day, creating its Day Entry if needed. Never changes the Flock. */
export function closingChange(state: AppState, date: DateKey, closing: Closing): StateChange {
  return dayEntryChange(state, date, { closing: { ...closing } });
}

/** Birds missing at Closing, per bird type. */
export type Shortfall = BirdCounts;

/** max(0, flock − counted) per bird type. */
export function shortfallOf(flock: Flock, closing: Closing): Shortfall {
  return {
    hens: Math.max(0, flock.hens - closing.hens),
    roosters: Math.max(0, flock.roosters - closing.roosters),
  };
}

/** True when at least one bird was not counted at Closing (otherwise "all in"). */
export function hasShortfall(shortfall: Shortfall): boolean {
  return shortfall.hens > 0 || shortfall.roosters > 0;
}

/** Laying Rate per month, January first (fixed, not configurable). */
const LAYING_RATE_BY_MONTH = [0.3, 0.4, 0.65, 0.8, 0.8, 0.75, 0.7, 0.65, 0.55, 0.4, 0.25, 0.25] as const;

/** The expected fraction of hens laying an egg on the given date. */
export function layingRate(date: DateKey): number {
  return LAYING_RATE_BY_MONTH[fromDateKey(date).getMonth()];
}

/** Hens in the day's Flock × the month's Laying Rate. */
export function expectedEggs(flock: Flock, date: DateKey): number {
  return flock.hens * layingRate(date);
}

export type EggRating = 'poor' | 'normal' | 'great';

/**
 * Compares the Egg Count with Expected Eggs: below 60% is poor, 60–120%
 * inclusive is normal, above 120% is great. Undefined when the Flock has no hens.
 */
export function rateEggCount(eggCount: number, flock: Flock, date: DateKey): EggRating | undefined {
  const expected = expectedEggs(flock, date);
  if (expected === 0) return undefined;
  const ratio = eggCount / expected;
  if (ratio < 0.6) return 'poor';
  if (ratio > 1.2) return 'great';
  return 'normal';
}

/** Records the Egg Count for a date, creating its Day Entry if needed. */
export function eggCountChange(state: AppState, date: DateKey, eggCount: number): StateChange {
  return dayEntryChange(state, date, { eggCount: Math.max(0, eggCount) });
}

/** The date `days` calendar days after `date` (negative goes back). */
export function addDays(date: DateKey, days: number): DateKey {
  const moment = fromDateKey(date);
  moment.setDate(moment.getDate() + days);
  return toDateKey(moment);
}

/** Totals over a window of recent days, for the History summary. */
export type DaysSummary = {
  totalEggs: number;
  /** Total eggs ÷ days in the window that have an Egg Count; 0 when none do. */
  averageEggs: number;
  /** Days in the window whose Closing had a Shortfall. */
  shortfallDays: number;
};

/** Summarises the `days` calendar days ending on `today`, inclusive. */
export function summarizeDays(dayEntries: AppState['dayEntries'], today: DateKey, days: number): DaysSummary {
  const first = addDays(today, -(days - 1));
  let totalEggs = 0;
  let daysWithEggCount = 0;
  let shortfallDays = 0;
  for (const [date, entry] of Object.entries(dayEntries)) {
    if (date < first || date > today) continue;
    if (entry.eggCount !== undefined) {
      totalEggs += entry.eggCount;
      daysWithEggCount += 1;
    }
    if (entry.closing && hasShortfall(shortfallOf(entry.flock, entry.closing))) shortfallDays += 1;
  }
  return {
    totalEggs,
    averageEggs: daysWithEggCount > 0 ? totalEggs / daysWithEggCount : 0,
    shortfallDays,
  };
}
