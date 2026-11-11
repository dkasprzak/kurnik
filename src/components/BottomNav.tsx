export type Tab = 'today' | 'settings';

/** Bottom-bar tabs, in display order. Add new screens here. */
const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Dziś' },
  { id: 'settings', label: 'Ustawienia' },
];

type Props = {
  current: Tab;
  onSelect: (tab: Tab) => void;
};

/** Thumb-reachable tab bar fixed to the bottom of the screen. */
export function BottomNav({ current, onSelect }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Nawigacja">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="bottom-nav-tab"
          aria-current={tab.id === current ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
