import { useState } from 'react';
import { systemClock, type Clock } from './clock';
import { toDateKey, type AppState, type Flock } from './domain';
import { createLocalStorage, type AppStorage } from './storage';
import { FlockSetupScreen } from './screens/FlockSetupScreen';
import { TodayScreen } from './screens/TodayScreen';

export type AppProps = {
  /** Source of "today"; defaults to the real date. */
  clock?: Clock;
  /** Persistence of the whole app state; defaults to localStorage. */
  storage?: AppStorage;
};

const defaultStorage = createLocalStorage();

export function App({ clock = systemClock, storage = defaultStorage }: AppProps) {
  const [state, setState] = useState<AppState>(() => storage.load());
  const today = toDateKey(clock());

  function update(next: AppState) {
    storage.save(next);
    setState(next);
  }

  function saveFlock(flock: Flock) {
    update({ ...state, flock });
  }

  if (!state.flock) {
    return <FlockSetupScreen onSave={saveFlock} />;
  }
  return <TodayScreen today={today} flock={state.flock} />;
}
