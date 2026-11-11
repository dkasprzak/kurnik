import { expectedEggs, rateEggCount, type DateKey, type Flock } from '../domain';
import { EGG_RATING_LABELS, formatDecimal } from '../polish';

type Props = {
  date: DateKey;
  /** The Flock of the Day Entry (or the current Flock if none exists yet). */
  flock: Flock;
  eggCount: number;
  onChange: (eggCount: number) => void;
};

export function EggCountCard({ date, flock, eggCount, onChange }: Props) {
  const rating = rateEggCount(eggCount, flock, date);
  return (
    <section className="card" aria-label="Jajka">
      <p className="card-label">Jajka dziś</p>
      <div className="egg-stepper">
        <button
          type="button"
          className="egg-stepper-button"
          aria-label="Odejmij jajko"
          disabled={eggCount === 0}
          onClick={() => onChange(eggCount - 1)}
        >
          −
        </button>
        <output className="egg-stepper-value" data-testid="egg-count">
          {eggCount}
        </output>
        <button
          type="button"
          className="egg-stepper-button"
          aria-label="Dodaj jajko"
          onClick={() => onChange(eggCount + 1)}
        >
          +
        </button>
      </div>
      <p className="hint">Oczekiwane: {formatDecimal(expectedEggs(flock, date))}</p>
      {rating && <p className={`egg-rating egg-rating-${rating}`}>Ocena: {EGG_RATING_LABELS[rating]}</p>}
    </section>
  );
}
