import { screen, within } from '@testing-library/react';
import type { AppState } from './domain';
import { createMemoryStorage } from './storage';
import { renderApp } from './test/renderApp';

type User = ReturnType<typeof renderApp>['user'];

const nav = () => screen.getByRole('navigation', { name: 'Nawigacja' });
const openHistory = (user: User) => user.click(within(nav()).getByRole('button', { name: 'Historia' }));
const dayList = () => screen.getByRole('list', { name: 'Dni' });
const dayRows = () => within(dayList()).getAllByRole('listitem');
const eggCard = () => screen.getByRole('region', { name: 'Jajka' });
const closingCard = () => screen.getByRole('region', { name: 'Zamknięcie kurnika' });

function seededStorage(dayEntries: AppState['dayEntries']) {
  return createMemoryStorage({ flock: { hens: 5, roosters: 1 }, dayEntries });
}

describe('History', () => {
  it('lists Day Entries newest first and leaves out days without an entry', async () => {
    const storage = seededStorage({
      '2026-11-08': { flock: { hens: 5, roosters: 1 }, eggCount: 1 },
      '2026-11-10': { flock: { hens: 5, roosters: 1 }, eggCount: 2 },
      '2026-11-03': { flock: { hens: 5, roosters: 1 }, eggCount: 3 },
    });
    const { user } = renderApp({ today: '2026-11-11', storage });

    await openHistory(user);

    expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
    const rows = dayRows();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('wtorek, 10 listopada 2026');
    expect(rows[1]).toHaveTextContent('niedziela, 8 listopada 2026');
    expect(rows[2]).toHaveTextContent('wtorek, 3 listopada 2026');
  });

  it('shows the Egg Count with its Egg Rating and the Closing status of each day', async () => {
    // November: 5 hens × 0.25 = 1.25 Expected Eggs
    const storage = seededStorage({
      '2026-11-10': { flock: { hens: 5, roosters: 1 }, eggCount: 2, closing: { hens: 5, roosters: 1 } },
      '2026-11-09': { flock: { hens: 5, roosters: 1 }, eggCount: 1, closing: { hens: 4, roosters: 1 } },
      '2026-11-08': { flock: { hens: 5, roosters: 1 }, closing: { hens: 5, roosters: 0 } },
      '2026-11-07': { flock: { hens: 5, roosters: 1 }, eggCount: 0 },
    });
    const { user } = renderApp({ today: '2026-11-11', storage });

    await openHistory(user);

    const [allIn, oneHenMissing, roosterMissing, notClosed] = dayRows();
    expect(allIn).toHaveTextContent('Jajka: 2 (świetnie)');
    expect(allIn).toHaveTextContent('Wszystkie ptaki w kurniku');
    expect(oneHenMissing).toHaveTextContent('Jajka: 1 (norma)');
    expect(oneHenMissing).toHaveTextContent('Brakuje 1 kury');
    expect(roosterMissing).toHaveTextContent('Jajka: —');
    expect(roosterMissing).toHaveTextContent('Brakuje koguta');
    expect(notClosed).toHaveTextContent('Jajka: 0 (słabo)');
    expect(notClosed).toHaveTextContent('Nie zamknięto');
  });

  it('opens a listed day and saves corrections to that Day Entry', async () => {
    const storage = seededStorage({
      '2026-11-09': { flock: { hens: 5, roosters: 1 }, eggCount: 1 },
    });
    const { user } = renderApp({ today: '2026-11-11', storage });
    await openHistory(user);

    await user.click(within(dayList()).getByRole('button', { name: /poniedziałek, 9 listopada 2026/ }));

    expect(screen.getByRole('heading', { name: 'poniedziałek, 9 listopada 2026' })).toBeInTheDocument();
    expect(within(eggCard()).getByTestId('egg-count')).toHaveTextContent('1');
    await user.click(within(eggCard()).getByRole('button', { name: 'Dodaj jajko' }));
    await user.click(within(closingCard()).getByRole('button', { name: 'Mniej kur' }));
    await user.click(within(closingCard()).getByRole('button', { name: 'Zamknij kurnik' }));
    expect(within(closingCard()).getByText('Brakuje 1 kury')).toBeInTheDocument();

    expect(storage.load().dayEntries).toEqual({
      '2026-11-09': { flock: { hens: 5, roosters: 1 }, eggCount: 2, closing: { hens: 4, roosters: 1 } },
    });

    await user.click(screen.getByRole('button', { name: 'Wróć do historii' }));
    const [row] = dayRows();
    expect(row).toHaveTextContent('Jajka: 2 (świetnie)');
    expect(row).toHaveTextContent('Brakuje 1 kury');
  });

  it("rates a past day in another month using that month's Laying Rate and the day's own Flock", async () => {
    // The Flock has changed since May; the May entry keeps its own snapshot of 10 hens.
    const storage = createMemoryStorage({
      flock: { hens: 2, roosters: 0 },
      dayEntries: { '2026-05-20': { flock: { hens: 10, roosters: 1 }, eggCount: 7 } },
    });
    const { user } = renderApp({ today: '2026-11-11', storage });
    await openHistory(user);

    // May: 10 hens × 0.80 = 8 Expected Eggs; 7 / 8 = 0.875 → normal
    // (with today's Flock and November it would be 2 × 0.25 = 0.5 → great)
    expect(dayRows()[0]).toHaveTextContent('Jajka: 7 (norma)');

    await user.click(within(dayList()).getByRole('button', { name: /20 maja 2026/ }));
    expect(within(eggCard()).getByText('Oczekiwane: 8')).toBeInTheDocument();
    expect(within(eggCard()).getByText('Ocena: norma')).toBeInTheDocument();
  });

  it('backfills a past day without an entry using a snapshot of the current Flock', async () => {
    const storage = seededStorage({});
    const { user } = renderApp({ today: '2026-11-11', storage });
    await openHistory(user);
    expect(within(dayList()).queryAllByRole('listitem')).toHaveLength(0);

    await user.type(screen.getByLabelText('Wybierz dzień'), '2026-11-10');
    await user.click(screen.getByRole('button', { name: 'Otwórz dzień' }));

    expect(screen.getByRole('heading', { name: 'wtorek, 10 listopada 2026' })).toBeInTheDocument();
    expect(screen.getByText('Brak wpisu dla tego dnia')).toBeInTheDocument();
    await user.click(within(eggCard()).getByRole('button', { name: 'Dodaj jajko' }));

    expect(storage.load().dayEntries).toEqual({
      '2026-11-10': { flock: { hens: 5, roosters: 1 }, eggCount: 1 },
    });
    await user.click(screen.getByRole('button', { name: 'Wróć do historii' }));
    expect(dayRows()[0]).toHaveTextContent('wtorek, 10 listopada 2026');
  });

  it('does not allow a future date to be opened', async () => {
    const { user } = renderApp({ today: '2026-11-11', storage: seededStorage({}) });
    await openHistory(user);
    const picker = screen.getByLabelText('Wybierz dzień');
    expect(picker).toHaveAttribute('max', '2026-11-11');

    await user.type(picker, '2026-11-12');
    expect(screen.getByRole('button', { name: 'Otwórz dzień' })).toBeDisabled();
    expect(screen.getByText('Nie można otworzyć przyszłego dnia')).toBeInTheDocument();

    await user.clear(picker);
    await user.type(picker, '2026-11-11');
    expect(screen.getByRole('button', { name: 'Otwórz dzień' })).toBeEnabled();
  });
});

describe('History summary', () => {
  /** The value shown next to a labelled statistic in a summary window. */
  const stat = (windowName: string, label: string) =>
    within(screen.getByRole('region', { name: windowName })).getByText(label).nextElementSibling;

  it('totals eggs, averages over days with an Egg Count and counts Shortfall days for 7 and 30 days', async () => {
    const flock = { hens: 5, roosters: 1 };
    const storage = seededStorage({
      // inside the last 7 days (2026-11-05 … 2026-11-11)
      '2026-11-11': { flock, eggCount: 2 },
      '2026-11-10': { flock, eggCount: 1, closing: { hens: 4, roosters: 1 } },
      '2026-11-09': { flock, closing: { hens: 5, roosters: 0 } },
      '2026-11-05': { flock, eggCount: 4, closing: { hens: 5, roosters: 1 } },
      // inside the last 30 days only (2026-10-13 … 2026-11-04)
      '2026-11-04': { flock, eggCount: 3, closing: { hens: 3, roosters: 1 } },
      '2026-10-13': { flock, eggCount: 5 },
      // outside both windows
      '2026-10-12': { flock, eggCount: 9, closing: { hens: 0, roosters: 0 } },
    });
    const { user } = renderApp({ today: '2026-11-11', storage });

    await openHistory(user);

    // 7 days: 2 + 1 + 4 = 7 eggs over 3 days with an Egg Count → 2,3; Shortfall on the 10th and 9th
    expect(stat('Ostatnie 7 dni', 'Jajka razem')).toHaveTextContent(/^7$/);
    expect(stat('Ostatnie 7 dni', 'Średnio dziennie')).toHaveTextContent(/^2,3$/);
    expect(stat('Ostatnie 7 dni', 'Dni z brakami')).toHaveTextContent(/^2$/);

    // 30 days: 7 + 3 + 5 = 15 eggs over 5 days → 3,0; Shortfall on the 10th, 9th and 4th
    expect(stat('Ostatnie 30 dni', 'Jajka razem')).toHaveTextContent(/^15$/);
    expect(stat('Ostatnie 30 dni', 'Średnio dziennie')).toHaveTextContent(/^3,0$/);
    expect(stat('Ostatnie 30 dni', 'Dni z brakami')).toHaveTextContent(/^3$/);
  });

  it('shows zeros, not NaN, when no day in the window has data', async () => {
    const storage = seededStorage({
      '2026-11-10': { flock: { hens: 5, roosters: 1 } },
      '2026-09-01': { flock: { hens: 5, roosters: 1 }, eggCount: 4 },
    });
    const { user } = renderApp({ today: '2026-11-11', storage });

    await openHistory(user);

    for (const windowName of ['Ostatnie 7 dni', 'Ostatnie 30 dni']) {
      expect(stat(windowName, 'Jajka razem')).toHaveTextContent(/^0$/);
      expect(stat(windowName, 'Średnio dziennie')).toHaveTextContent(/^0,0$/);
      expect(stat(windowName, 'Dni z brakami')).toHaveTextContent(/^0$/);
    }
  });
});
