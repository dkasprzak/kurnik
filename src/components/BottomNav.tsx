export type Tab = 'today' | 'history';

/** Tabs in the bottom navigation bar, in display order. */
const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'today', label: 'Dziś' },
  { id: 'history', label: 'Historia' },
];

type Props = {
  active: Tab;
  onSelect: (tab: Tab) => void;
};

export function BottomNav({ active, onSelect }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Nawigacja">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="bottom-nav-tab"
          aria-current={tab.id === active ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
