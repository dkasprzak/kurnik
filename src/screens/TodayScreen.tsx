import type { DateKey, DayEntry, Flock } from '../domain';
import { describeFlock, formatLongDate } from '../polish';
import { EggCountCard } from './EggCountCard';

type Props = {
  today: DateKey;
  flock: Flock;
  /** Today's Day Entry, if one exists yet. */
  dayEntry?: DayEntry;
  onEggCountChange: (eggCount: number) => void;
};

export function TodayScreen({ today, flock, dayEntry, onEggCountChange }: Props) {
  const dayFlock = dayEntry?.flock ?? flock;
  const eggCount = dayEntry?.eggCount ?? 0;
  return (
    <main className="screen">
      <header className="screen-header">
        <h1>Dziś</h1>
        <p className="hint">{formatLongDate(today)}</p>
      </header>
      <section className="card" aria-label="Stado">
        <p className="card-label">Twoje stado</p>
        <p className="card-value">{describeFlock(flock)}</p>
      </section>
      <EggCountCard date={today} flock={dayFlock} eggCount={eggCount} onChange={onEggCountChange} />
    </main>
  );
}
