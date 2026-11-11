import type { Closing, DateKey, DayEntry, Flock } from '../domain';
import { ClosingCard } from './ClosingCard';
import { EggCountCard } from './EggCountCard';

export type DayCardsHandlers = {
  onEggCountChange: (eggCount: number) => void;
  onSaveClosing: (closing: Closing) => void;
};

type Props = DayCardsHandlers & {
  date: DateKey;
  /** The current Flock; used until the day has a Day Entry with its own snapshot. */
  flock: Flock;
  dayEntry?: DayEntry;
  isToday: boolean;
};

/** The Egg Count and Closing cards of one day, judged against that day's Flock. */
export function DayCards({ date, flock, dayEntry, isToday, onEggCountChange, onSaveClosing }: Props) {
  const dayFlock = dayEntry?.flock ?? flock;
  return (
    <>
      <EggCountCard
        date={date}
        flock={dayFlock}
        eggCount={dayEntry?.eggCount}
        onChange={onEggCountChange}
        isToday={isToday}
      />
      <ClosingCard flock={dayFlock} closing={dayEntry?.closing} onSave={onSaveClosing} />
    </>
  );
}
