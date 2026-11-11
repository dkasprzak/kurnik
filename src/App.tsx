import { useState } from 'react';
import { systemClock, type Clock } from './clock';
import { changeFlock, saveClosing, saveEggCount, toDateKey, type AppState, type DateKey, type Flock } from './domain';
import { createLocalStorage, type AppStorage } from './storage';
import { BottomNav, type Tab } from './components/BottomNav';
import type { DayCardsHandlers } from './components/DayCards';
import { DayDetailScreen } from './screens/DayDetailScreen';
import { FlockSetupScreen } from './screens/FlockSetupScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
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
      {tab === 'settings' && <SettingsScreen flock={state.flock} onSaveFlock={saveFlock} />}
      <BottomNav current={tab} onSelect={selectTab} />
    </div>
  );
}
