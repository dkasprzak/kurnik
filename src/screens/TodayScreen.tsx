import type { Closing, DateKey, DayEntry, Flock } from '../domain';
import { ClosingCard } from '../components/ClosingCard';
import { describeFlock, formatLongDate } from '../polish';

type Props = {
  today: DateKey;
  flock: Flock;
  /** Today's Day Entry, if one has been saved. */
  dayEntry?: DayEntry;
  onSaveClosing: (closing: Closing) => void;
};

export function TodayScreen({ today, flock, dayEntry, onSaveClosing }: Props) {
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
      <ClosingCard flock={dayEntry?.flock ?? flock} closing={dayEntry?.closing} onSave={onSaveClosing} />
    </main>
  );
}
