import { fromDateKey, type DateKey, type Flock } from './domain';

/** E.g. "niedziela, 3 maja 2026". */
export function formatLongDate(key: DateKey): string {
  return new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fromDateKey(key));
}

/** Polish plural forms: [one, few (2–4), many]. */
type PluralForms = readonly [string, string, string];

export function pluralize(count: number, [one, few, many]: PluralForms): string {
  if (count === 1) return one;
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) return few;
  return many;
}

export const HEN_FORMS: PluralForms = ['kura', 'kury', 'kur'];
export const ROOSTER_FORMS: PluralForms = ['kogut', 'koguty', 'kogutów'];

export function countOf(count: number, forms: PluralForms): string {
  return `${count} ${pluralize(count, forms)}`;
}

/** E.g. "5 kur, 1 kogut". */
export function describeFlock(flock: Flock): string {
  return `${countOf(flock.hens, HEN_FORMS)}, ${countOf(flock.roosters, ROOSTER_FORMS)}`;
}
