import type { DateKey, DayEntry, Flock } from '../domain';
import { DayCards, type DayCardsHandlers } from '../components/DayCards';
import { describeFlock, formatLongDate } from '../polish';

type Props = DayCardsHandlers & {
  today: DateKey;
  flock: Flock;
  /** Today's Day Entry, if one exists yet. */
  dayEntry?: DayEntry;
};

export function TodayScreen({ today, flock, dayEntry, ...handlers }: Props) {
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
      <DayCards date={today} flock={flock} dayEntry={dayEntry} isToday {...handlers} />
    </main>
  );
}
