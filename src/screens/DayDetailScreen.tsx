import type { Closing, DateKey, DayEntry, Flock } from '../domain';
import { ClosingCard } from '../components/ClosingCard';
import { describeFlock, formatLongDate } from '../polish';
import { EggCountCard } from './EggCountCard';

type Props = {
  date: DateKey;
  /** The current Flock; becomes the snapshot if the day has no Day Entry yet. */
  flock: Flock;
  dayEntry?: DayEntry;
  onEggCountChange: (eggCount: number) => void;
  onSaveClosing: (closing: Closing) => void;
  onBack: () => void;
};

/** A single (usually past) day, with the same cards as the Today screen. */
export function DayDetailScreen({ date, flock, dayEntry, onEggCountChange, onSaveClosing, onBack }: Props) {
  const dayFlock = dayEntry?.flock ?? flock;
  return (
    <main className="screen">
      <button type="button" className="button-link" onClick={onBack}>
        <span aria-hidden="true">← </span>Wróć do historii
      </button>
      <header className="screen-header">
        <h1>{formatLongDate(date)}</h1>
        <p className="hint">{dayEntry ? `Stado tego dnia: ${describeFlock(dayFlock)}` : 'Brak wpisu dla tego dnia'}</p>
      </header>
      <EggCountCard
        date={date}
        flock={dayFlock}
        eggCount={dayEntry?.eggCount ?? 0}
        onChange={onEggCountChange}
        label="Jajka"
      />
      <ClosingCard flock={dayFlock} closing={dayEntry?.closing} onSave={onSaveClosing} />
    </main>
  );
}
