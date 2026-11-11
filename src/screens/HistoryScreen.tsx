import { useState } from 'react';
import {
  hasShortfall,
  rateEggCount,
  shortfallOf,
  summarizeDays,
  type AppState,
  type DateKey,
  type DayEntry,
  type DaysSummary,
} from '../domain';
import { EGG_RATING_LABELS, describeShortfall, formatAverageEggs, formatLongDate } from '../plText';

/** Total eggs, average per day and Shortfall day count for one window of recent days. */
function SummaryCard({ title, summary }: { title: string; summary: DaysSummary }) {
  const headingId = `summary-${title.replace(/\s+/g, '-')}`;
  return (
    <section className="card summary-card" aria-labelledby={headingId}>
      <h2 id={headingId} className="card-label">
        {title}
      </h2>
      <dl className="summary-stats">
        <dt>Jajka razem</dt>
        <dd>{summary.totalEggs}</dd>
        <dt>Średnio dziennie</dt>
        <dd>{formatAverageEggs(summary.averageEggs)}</dd>
        <dt>Dni z brakami</dt>
        <dd>{summary.shortfallDays}</dd>
      </dl>
    </section>
  );
}

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
      <div className="summary">
        <SummaryCard title="Ostatnie 7 dni" summary={summarizeDays(dayEntries, today, 7)} />
        <SummaryCard title="Ostatnie 30 dni" summary={summarizeDays(dayEntries, today, 30)} />
      </div>
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
  if (!hasShortfall(shortfall)) return 'Wszystkie ptaki w kurniku';
  return describeShortfall(shortfall).join(', ');
}
