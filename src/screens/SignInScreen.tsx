import { useState, type FormEvent } from 'react';
import { SignInError, type SignInFailure } from '../auth';

type Props = {
  /** Resolves once signed in; rejects with a `SignInError` otherwise. */
  onSignIn: (email: string, password: string) => Promise<void>;
};

const ERROR_MESSAGES: Record<SignInFailure, string> = {
  'wrong-credentials': 'Nieprawidłowy e-mail lub hasło.',
  'too-many-attempts': 'Zbyt wiele prób. Spróbuj ponownie za chwilę.',
  network: 'Brak połączenia z internetem. Spróbuj ponownie.',
  unknown: 'Nie udało się zalogować. Spróbuj ponownie.',
};

/** Email + password sign-in to the shared Household Account. */
export function SignInScreen({ onSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<SignInFailure>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onSignIn(email.trim(), password);
    } catch (failure) {
      setError(failure instanceof SignInError ? failure.reason : 'unknown');
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <h1>Zaloguj się</h1>
      <p className="hint">Użyj wspólnego konta domowego.</p>
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Hasło</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {ERROR_MESSAGES[error]}
          </p>
        )}
        <button type="submit" className="button-primary" disabled={busy}>
          Zaloguj
        </button>
      </form>
    </main>
  );
}
