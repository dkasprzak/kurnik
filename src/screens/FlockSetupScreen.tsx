import { useState, type FormEvent } from 'react';
import { validateFlock, type Flock, type FlockError } from '../domain';

type Props = {
  onSave: (flock: Flock) => void;
};

const ERROR_MESSAGES: Record<FlockError, string> = {
  'invalid-count': 'Podaj liczby całkowite, 0 lub więcej.',
  empty: 'Stado musi mieć co najmniej jednego ptaka.',
};

export function FlockSetupScreen({ onSave }: Props) {
  const [hens, setHens] = useState('0');
  const [roosters, setRoosters] = useState('0');
  const [error, setError] = useState<FlockError>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const flock = { hens: Number(hens), roosters: Number(roosters) };
    const validationError = validateFlock(flock);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(flock);
  }

  return (
    <main className="screen">
      <h1>Twoje stado</h1>
      <p className="hint">Ile masz kur i kogutów?</p>
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
    </main>
  );
}
