import type { DateKey, DayEntry, Flock } from '../domain';
import { DayCards, type DayCardsHandlers } from '../components/DayCards';
import { describeFlock, formatLongDate } from '../plText';

type Props = DayCardsHandlers & {
  date: DateKey;
  /** The current Flock; becomes the snapshot if the day has no Day Entry yet. */
  flock: Flock;
  dayEntry?: DayEntry;
  onBack: () => void;
};

/** A single (usually past) day, with the same cards as the Today screen. */
export function DayDetailScreen({ date, flock, dayEntry, onBack, ...handlers }: Props) {
  return (
    <main className="screen">
      <button type="button" className="button-link" onClick={onBack}>
        <span aria-hidden="true">← </span>Wróć do historii
      </button>
      <header className="screen-header">
        <h1>{formatLongDate(date)}</h1>
        <p className="hint">
          {dayEntry ? `Stado tego dnia: ${describeFlock(dayEntry.flock)}` : 'Brak wpisu dla tego dnia'}
        </p>
      </header>
      <DayCards date={date} flock={flock} dayEntry={dayEntry} isToday={false} {...handlers} />
    </main>
  );
}
