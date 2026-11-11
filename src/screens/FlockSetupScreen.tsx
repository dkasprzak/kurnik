import type { Flock } from '../domain';
import { FlockForm } from '../components/FlockForm';

type Props = {
  onSave: (flock: Flock) => void;
};

export function FlockSetupScreen({ onSave }: Props) {
  return (
    <main className="screen">
      <h1>Twoje stado</h1>
      <p className="hint">Ile masz kur i kogutów?</p>
      <FlockForm onSave={onSave} />
    </main>
  );
}
