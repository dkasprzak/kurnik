import { useEffect, useState } from 'react';
import type { Account, AuthAdapter } from './auth';
import { systemClock, type Clock } from './clock';
import {
  closingChange,
  eggCountChange,
  flockChange,
  toDateKey,
  type AppState,
  type DateKey,
  type Flock,
  type StateChange,
} from './domain';
import type { AppStorage } from './storage';
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
  /** Opens the shared data of a Household Account (Firestore in the real app, in-memory in tests). */
  openStorage: (account: Account) => AppStorage;
  /** Sign-in to the Household Account (Firebase in the real app, a fake in tests). */
  auth: AuthAdapter;
};

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

function HouseholdApp({ clock = systemClock, openStorage, account, onSignOut }: HouseholdAppProps) {
  // HouseholdApp is keyed by uid, so the storage is opened once per account.
  const [storage] = useState(() => openStorage(account));
  /** undefined until the first snapshot of the shared data arrives. */
  const [state, setState] = useState<AppState | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('today');
  /** The day open in the day detail screen (History tab only). */
  const [openDay, setOpenDay] = useState<DateKey | undefined>(undefined);
  const today = toDateKey(clock());

  useEffect(() => storage.subscribe(setState), [storage]);

  function write(change: (state: AppState) => StateChange) {
    if (state) storage.write(change(state));
  }

  function saveFlock(flock: Flock) {
    write((s) => flockChange(s, today, flock));
  }

  /** Records the Egg Count and Closing of one day. */
  function dayHandlers(date: DateKey): DayCardsHandlers {
    return {
      onSaveClosing: (closing) => write((s) => closingChange(s, date, closing)),
      onEggCountChange: (eggCount) => write((s) => eggCountChange(s, date, eggCount)),
    };
  }

  function selectTab(next: Tab) {
    setTab(next);
    setOpenDay(undefined);
  }

  if (!state) {
    return <p className="hint">Wczytywanie danych…</p>;
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
