import { useState } from 'react';
import { systemClock, type Clock } from './clock';
import { saveClosing, saveEggCount, toDateKey, type AppState, type DateKey, type Flock } from './domain';
import { createLocalStorage, type AppStorage } from './storage';
import { BottomNav, type Tab } from './components/BottomNav';
import { DayDetailScreen } from './screens/DayDetailScreen';
import { FlockSetupScreen } from './screens/FlockSetupScreen';
import { HistoryScreen } from './screens/HistoryScreen';
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
    update({ ...state, flock });
  }

  if (!state.flock) {
    return <FlockSetupScreen onSave={saveFlock} />;
  }
  function selectTab(next: Tab) {
    setTab(next);
    setOpenDay(undefined);
  }

  const flock = state.flock;
  return (
    <>
      {tab === 'history' && openDay && (
        <DayDetailScreen
          key={openDay}
          date={openDay}
          flock={flock}
          dayEntry={state.dayEntries[openDay]}
          onSaveClosing={(closing) => update(saveClosing(state, openDay, closing))}
          onEggCountChange={(eggCount) => update(saveEggCount(state, openDay, eggCount))}
          onBack={() => setOpenDay(undefined)}
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
      {tab === 'today' && (
        <TodayScreen
          today={today}
          flock={flock}
          dayEntry={state.dayEntries[today]}
          onSaveClosing={(closing) => update(saveClosing(state, today, closing))}
          onEggCountChange={(eggCount) => update(saveEggCount(state, today, eggCount))}
        />
      )}
      <BottomNav active={tab} onSelect={selectTab} />
    </>
  );
}
