import type { DateKey, Flock } from '../domain';
import { describeFlock, formatLongDate } from '../polish';

type Props = {
  today: DateKey;
  flock: Flock;
};

export function TodayScreen({ today, flock }: Props) {
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
    </main>
  );
}
