import { useState } from 'react';
import { isAllIn, rateEggCount, shortfallOf, type AppState, type DateKey, type DayEntry } from '../domain';
import { EGG_RATING_LABELS, describeMissingHens, describeMissingRoosters, formatLongDate } from '../polish';

type Props = {
  today: DateKey;
  dayEntries: AppState['dayEntries'];
  onOpenDay: (date: DateKey) => void;
};

export function HistoryScreen({ today, dayEntries, onOpenDay }: Props) {
  const dates = Object.keys(dayEntries).sort().reverse();
  return (
    <main className="screen">
      <header className="screen-header">
        <h1>Historia</h1>
      </header>
      <DayPicker today={today} onOpenDay={onOpenDay} />
      <ul className="day-list" aria-label="Dni">
        {dates.map((date) => (
          <li key={date}>
            <DayRow date={date} entry={dayEntries[date]} onOpen={() => onOpenDay(date)} />
          </li>
        ))}
      </ul>
    </main>
  );
}

/** Opens any day up to today, e.g. to backfill a forgotten day with no entry. */
function DayPicker({ today, onOpenDay }: { today: DateKey; onOpenDay: (date: DateKey) => void }) {
  const [date, setDate] = useState<DateKey>('');
  const isFuture = date > today;
  return (
    <section className="card day-picker" aria-label="Inny dzień">
      <label className="card-label" htmlFor="day-picker-date">
        Wybierz dzień
      </label>
      <div className="day-picker-row">
        <input
          id="day-picker-date"
          className="input"
          type="date"
          max={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <button
          type="button"
          className="button-secondary"
          disabled={!date || isFuture}
          onClick={() => onOpenDay(date)}
        >
          Otwórz dzień
        </button>
      </div>
      {isFuture && (
        <p className="hint" role="alert">
          Nie można otworzyć przyszłego dnia
        </p>
      )}
    </section>
  );
}

function DayRow({ date, entry, onOpen }: { date: DateKey; entry: DayEntry; onOpen: () => void }) {
  return (
    <button type="button" className="day-row" onClick={onOpen}>
      <span className="day-row-date">{formatLongDate(date)}</span>
      <span className="day-row-eggs">{describeEggs(date, entry)}</span>
      <span className="day-row-closing">{describeClosing(entry)}</span>
    </button>
  );
}

/** E.g. "Jajka: 2 (świetnie)", or "Jajka: —" when no Egg Count was recorded. */
function describeEggs(date: DateKey, entry: DayEntry): string {
  if (entry.eggCount === undefined) return 'Jajka: —';
  const rating = rateEggCount(entry.eggCount, entry.flock, date);
  return rating ? `Jajka: ${entry.eggCount} (${EGG_RATING_LABELS[rating]})` : `Jajka: ${entry.eggCount}`;
}

/** All in, the Shortfall, or "not closed". */
function describeClosing(entry: DayEntry): string {
  if (!entry.closing) return 'Nie zamknięto';
  const shortfall = shortfallOf(entry.flock, entry.closing);
  if (isAllIn(shortfall)) return 'Wszystkie ptaki w kurniku';
  const parts: string[] = [];
  if (shortfall.hens > 0) parts.push(describeMissingHens(shortfall.hens));
  if (shortfall.roosters > 0) parts.push(describeMissingRoosters(shortfall.roosters));
  return parts.join(', ');
}
