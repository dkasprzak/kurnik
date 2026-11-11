import { useState, type FormEvent } from 'react';
import { validateFlock, type Flock, type FlockError } from '../domain';

type Props = {
  /** Values the form starts with; defaults to an empty Flock. */
  initial?: Flock;
  onSave: (flock: Flock) => void;
};

const ERROR_MESSAGES: Record<FlockError, string> = {
  'invalid-count': 'Podaj liczby całkowite, 0 lub więcej.',
  empty: 'Stado musi mieć co najmniej jednego ptaka.',
};

/** Hens + roosters form with Flock validation, shared by setup and Settings. */
export function FlockForm({ initial = { hens: 0, roosters: 0 }, onSave }: Props) {
  const [hens, setHens] = useState(String(initial.hens));
  const [roosters, setRoosters] = useState(String(initial.roosters));
  const [error, setError] = useState<FlockError>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const flock = { hens: Number(hens), roosters: Number(roosters) };
    const validationError = validateFlock(flock);
    setError(validationError);
    if (validationError) return;
    onSave(flock);
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Kury</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={hens}
          onChange={(e) => setHens(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Koguty</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={roosters}
          onChange={(e) => setRoosters(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {ERROR_MESSAGES[error]}
        </p>
      )}
      <button type="submit" className="button-primary">
        Zapisz
      </button>
    </form>
  );
}
