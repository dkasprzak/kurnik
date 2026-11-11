import { fromDateKey, type DateKey, type EggRating, type Flock, type Shortfall } from './domain';

/**
 * One decimal place at most, e.g. "1,3"; whole numbers without a fraction
 * unless `fixed` asks for exactly one decimal ("2,0").
 */
export function formatDecimal(value: number, { fixed = false }: { fixed?: boolean } = {}): string {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: fixed ? 1 : 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/** Average eggs per day, always with one decimal, e.g. "2,0". */
export const formatAverageEggs = (value: number) => formatDecimal(value, { fixed: true });

export const EGG_RATING_LABELS: Record<EggRating, string> = {
  poor: 'słabo',
  normal: 'norma',
  great: 'świetnie',
};

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

/** Genitive forms used after "brakuje" in a Shortfall: [one, few (2–4), many]. */
const SHORTFALL_HEN_FORMS: PluralForms = ['kury', 'kur', 'kur'];
const SHORTFALL_ROOSTER_FORMS: PluralForms = ['koguta', 'kogutów', 'kogutów'];

/** Shortfall of hens, e.g. "Brakuje 1 kury", "Brakuje 5 kur". */
export function describeShortfallHens(count: number): string {
  return `Brakuje ${count} ${pluralize(count, SHORTFALL_HEN_FORMS)}`;
}

/** Shortfall of roosters, e.g. "Brakuje koguta", "Brakuje 2 kogutów". */
export function describeShortfallRoosters(count: number): string {
  if (count === 1) return 'Brakuje koguta';
  return `Brakuje ${count} ${pluralize(count, SHORTFALL_ROOSTER_FORMS)}`;
}

/** One line per bird type with a Shortfall; empty when all birds are in. */
export function describeShortfall(shortfall: Shortfall): string[] {
  const lines: string[] = [];
  if (shortfall.hens > 0) lines.push(describeShortfallHens(shortfall.hens));
  if (shortfall.roosters > 0) lines.push(describeShortfallRoosters(shortfall.roosters));
  return lines;
}
