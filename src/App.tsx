import { useEffect, useState } from 'react';
import type { Account, AuthAdapter } from './auth';
import { systemClock, type Clock } from './clock';
import { changeFlock, saveClosing, saveEggCount, toDateKey, type AppState, type DateKey, type Flock } from './domain';
import { createLocalStorage, type AppStorage } from './storage';
import { BottomNav, type Tab } from './components/BottomNav';
import type { DayCardsHandlers } from './components/DayCards';
import { DayDetailScreen } from './screens/DayDetailScreen';
import { FlockSetupScreen } from './screens/FlockSetupScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SignInScreen } from './screens/SignInScreen';
import { TodayScreen } from './screens/TodayScreen';

export type AppProps = {
  /** Source of "today"; defaults to the real date. */
  clock?: Clock;
  /** Persistence of the whole app state; defaults to localStorage. */
  storage?: AppStorage;
  /** Sign-in to the Household Account (Firebase in the real app, a fake in tests). */
  auth: AuthAdapter;
};

const defaultStorage = createLocalStorage();

/** Gates the app behind the Household Account sign-in. */
export function App({ auth, ...rest }: AppProps) {
  /** undefined while the persisted session is still being restored. */
  const [account, setAccount] = useState<Account | null | undefined>(undefined);

  useEffect(() => auth.onAccountChange(setAccount), [auth]);

  if (account === undefined) {
    return <p className="hint">Ładowanie…</p>;
  }
  if (account === null) {
    return <SignInScreen onSignIn={(email, password) => auth.signIn(email, password)} />;
  }
  return <HouseholdApp key={account.uid} account={account} onSignOut={() => void auth.signOut()} {...rest} />;
}

type HouseholdAppProps = Omit<AppProps, 'auth'> & {
  /** The signed-in Household Account; its uid scopes the shared data. */
  account: Account;
  onSignOut: () => void;
};

function HouseholdApp({ clock = systemClock, storage = defaultStorage, onSignOut }: HouseholdAppProps) {
  const [state, setState] = useState<AppState>(() => storage.load());
  const [tab, setTab] = useState<Tab>('today');
  /** The day open in the day detail screen (History tab only). */
  const [openDay, setOpenDay] = useState<DateKey | undefined>(undefined);
  const today = toDateKey(clock());

  function update(next: AppState) {
    storage.save(next);
    setState(next);
  }

  function saveFlock(flock: Flock) {
    update(changeFlock(state, today, flock));
  }

  /** Records the Egg Count and Closing of one day. */
  function dayHandlers(date: DateKey): DayCardsHandlers {
    return {
      onSaveClosing: (closing) => update(saveClosing(state, date, closing)),
      onEggCountChange: (eggCount) => update(saveEggCount(state, date, eggCount)),
    };
  }

  function selectTab(next: Tab) {
    setTab(next);
    setOpenDay(undefined);
  }

  if (!state.flock) {
    return <FlockSetupScreen onSave={saveFlock} />;
  }
  return (
    <div className="app-shell">
      {tab === 'today' && (
        <TodayScreen
          today={today}
          flock={state.flock}
          dayEntry={state.dayEntries[today]}
          {...dayHandlers(today)}
        />
      )}
      {tab === 'history' && !openDay && (
        <HistoryScreen
          today={today}
          dayEntries={state.dayEntries}
          // Future days have not happened yet and cannot be recorded.
          onOpenDay={(date) => date <= today && setOpenDay(date)}
        />
      )}
      {tab === 'history' && openDay && (
        <DayDetailScreen
          key={openDay}
          date={openDay}
          flock={state.flock}
          dayEntry={state.dayEntries[openDay]}
          {...dayHandlers(openDay)}
          onBack={() => setOpenDay(undefined)}
        />
      )}
      {tab === 'settings' && <SettingsScreen flock={state.flock} onSaveFlock={saveFlock} onSignOut={onSignOut} />}
      <BottomNav current={tab} onSelect={selectTab} />
    </div>
  );
}
