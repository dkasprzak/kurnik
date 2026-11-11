import { useState } from 'react';
import type { Flock } from '../domain';
import { FlockForm } from '../components/FlockForm';
import { describeFlock } from '../plText';

type Props = {
  flock: Flock;
  onSaveFlock: (flock: Flock) => void;
};

export function SettingsScreen({ flock, onSaveFlock }: Props) {
  const [saved, setSaved] = useState(false);
  return (
    <main className="screen">
      <header className="screen-header">
        <h1>Ustawienia</h1>
        <p className="hint">Zmiana stada obowiązuje od dziś. Poprzednie dni zachowują swoje stado.</p>
      </header>
      <section aria-label="Twoje stado" className="settings-section">
        <h2 className="card-title">Twoje stado</h2>
        <FlockForm
          initial={flock}
          onSave={(next) => {
            onSaveFlock(next);
            setSaved(true);
          }}
        />
        {saved && (
          <p role="status" className="hint">
            Zapisano: {describeFlock(flock)}
          </p>
        )}
      </section>
    </main>
  );
}
