import { expectedEggs, rateEggCount, type DateKey, type Flock } from '../domain';
import { EGG_RATING_LABELS, formatDecimal } from '../plText';
import { Stepper } from './Stepper';

type Props = {
  date: DateKey;
  /** The Flock of the Day Entry (or the current Flock if none exists yet). */
  flock: Flock;
  /** Undefined until an Egg Count is recorded for the day. */
  eggCount: number | undefined;
  onChange: (eggCount: number) => void;
  /** True on the Today screen: "Jajka dziś" / "Dziś 0 jaj" instead of "Jajka" / "0 jaj". */
  isToday: boolean;
};

export function EggCountCard({ date, flock, eggCount, onChange, isToday }: Props) {
  const rating = eggCount === undefined ? undefined : rateEggCount(eggCount, flock, date);
  return (
    <section className="card" aria-label="Jajka">
      <Stepper
        size="large"
        label={isToday ? 'Jajka dziś' : 'Jajka'}
        value={eggCount}
        onChange={onChange}
        decreaseLabel="Odejmij jajko"
        increaseLabel="Dodaj jajko"
      />
      {eggCount === undefined && (
        <button type="button" className="button-secondary egg-zero-button" onClick={() => onChange(0)}>
          {isToday ? 'Dziś 0 jaj' : '0 jaj'}
        </button>
      )}
      <p className="hint">Oczekiwane: {formatDecimal(expectedEggs(flock, date))}</p>
      {rating && <p className={`egg-rating egg-rating-${rating}`}>Ocena: {EGG_RATING_LABELS[rating]}</p>}
    </section>
  );
}
