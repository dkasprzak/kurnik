import { act, screen } from '@testing-library/react';
import { closingChange, eggCountChange, flockChange } from './domain';
import { createMemoryStorage } from './storage';
import { renderApp } from './test/renderApp';
import { closingCard, eggCard, renderToday } from './test/helpers';

const TODAY = '2026-11-11';

describe('Shared Household data', () => {
  it("shows the other Keeper's Egg Count without reopening the app", async () => {
    const { storage } = renderToday({ hens: 5, roosters: 1 }, TODAY);
    expect(eggCard().getByLabelText('Jajka dziś')).toHaveTextContent('—');

    act(() => storage.write(eggCountChange(storage.current(), TODAY, 3)));

    expect(eggCard().getByLabelText('Jajka dziś')).toHaveTextContent('3');
  });

  it("shows the other Keeper's Flock change without reopening the app", async () => {
    const { storage } = renderToday({ hens: 5, roosters: 1 }, TODAY);

    act(() => storage.write(flockChange(storage.current(), TODAY, { hens: 7, roosters: 0 })));

    expect(screen.getByText(/^7 kur,/)).toBeInTheDocument();
  });

  it("keeps the other Keeper's Closing when I record the Egg Count afterwards", async () => {
    const { user, storage } = renderToday({ hens: 5, roosters: 1 }, TODAY);

    act(() => storage.write(closingChange(storage.current(), TODAY, { hens: 4, roosters: 1 })));
    await user.click(eggCard().getByRole('button', { name: 'Dodaj jajko' }));

    expect(storage.current().dayEntries[TODAY]).toEqual({
      flock: { hens: 5, roosters: 1 },
      closing: { hens: 4, roosters: 1 },
      eggCount: 1,
    });
    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 1 kury');
  });

  it("keeps my Closing when the other Keeper records the Egg Count afterwards", async () => {
    const { user, storage } = renderToday({ hens: 5, roosters: 1 }, TODAY);

    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));
    act(() => storage.write(eggCountChange(storage.current(), TODAY, 2)));

    expect(storage.current().dayEntries[TODAY]).toEqual({
      flock: { hens: 5, roosters: 1 },
      closing: { hens: 5, roosters: 1 },
      eggCount: 2,
    });
    expect(closingCard().getByText('Wszystkie ptaki w kurniku')).toBeInTheDocument();
    expect(eggCard().getByLabelText('Jajka dziś')).toHaveTextContent('2');
  });

  it('shows a loading state until the shared data arrives, not the Flock setup', async () => {
    const storage = createMemoryStorage({ flock: { hens: 5, roosters: 1 }, dayEntries: {} }, { deliverInitial: false });
    renderApp({ signedIn: true, today: TODAY, storage });

    expect(screen.getByText('Wczytywanie danych…')).toBeInTheDocument();
    expect(screen.queryByLabelText('Kury')).not.toBeInTheDocument();

    act(() => storage.deliver());

    expect(screen.getByText('5 kur, 1 kogut')).toBeInTheDocument();
  });
});
