import { useState } from 'react';
import { isAllIn, shortfallOf, type Closing, type Flock } from '../domain';
import { describeMissingHens, describeMissingRoosters } from '../polish';
import { Stepper } from './Stepper';

type Props = {
  /** The Flock the Closing is compared against (today's Day Entry snapshot, or the current Flock). */
  flock: Flock;
  /** Today's saved Closing, if any. */
  closing?: Closing;
  onSave: (closing: Closing) => void;
};

export function ClosingCard({ flock, closing, onSave }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <section className="card closing-card" aria-label="Zamknięcie kurnika">
      <h2 className="card-title">Zamknięcie kurnika</h2>
      {closing && !editing ? (
        <ClosingResult
          flock={flock}
          closing={closing}
          onEdit={() => setEditing(true)}
        />
      ) : (
        <ClosingForm
          flock={flock}
          initial={closing ?? flock}
          submitLabel={closing ? 'Zapisz zamknięcie' : 'Zamknij kurnik'}
          onSubmit={(counts) => {
            onSave(counts);
            setEditing(false);
          }}
        />
      )}
    </section>
  );
}

type FormProps = {
  flock: Flock;
  initial: Closing;
  submitLabel: string;
  onSubmit: (closing: Closing) => void;
};

function ClosingForm({ flock, initial, submitLabel, onSubmit }: FormProps) {
  const [counts, setCounts] = useState<Closing>({ hens: initial.hens, roosters: initial.roosters });
  const showRoosters = flock.roosters > 0;

  return (
    <div className="closing-form">
      <Stepper
        label="Kury w kurniku"
        value={counts.hens}
        onChange={(hens) => setCounts({ ...counts, hens })}
        decreaseLabel="Mniej kur"
        increaseLabel="Więcej kur"
      />
      {showRoosters && (
        <Stepper
          label="Koguty w kurniku"
          value={counts.roosters}
          onChange={(roosters) => setCounts({ ...counts, roosters })}
          decreaseLabel="Mniej kogutów"
          increaseLabel="Więcej kogutów"
        />
      )}
      <button
        type="button"
        className="button-primary"
        onClick={() => onSubmit({ hens: counts.hens, roosters: showRoosters ? counts.roosters : 0 })}
      >
        {submitLabel}
      </button>
    </div>
  );
}

type ResultProps = {
  flock: Flock;
  closing: Closing;
  onEdit: () => void;
};

function ClosingResult({ flock, closing, onEdit }: ResultProps) {
  const shortfall = shortfallOf(flock, closing);

  return (
    <div className="closing-result">
      {isAllIn(shortfall) ? (
        <p className="closing-all-in">Wszystkie ptaki w kurniku</p>
      ) : (
        <div className="closing-shortfall" role="alert">
          {shortfall.hens > 0 && <p>{describeMissingHens(shortfall.hens)}</p>}
          {shortfall.roosters > 0 && <p>{describeMissingRoosters(shortfall.roosters)}</p>}
        </div>
      )}
      <button type="button" className="button-secondary" onClick={onEdit}>
        Popraw
      </button>
    </div>
  );
}
