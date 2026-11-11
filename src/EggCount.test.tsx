import { screen, within } from '@testing-library/react';
import { renderApp } from './test/renderApp';
import { setUpFlock } from './test/setUpFlock';

type User = ReturnType<typeof renderApp>['user'];

const eggCard = () => screen.getByRole('region', { name: 'Jajka' });
const eggCountValue = () => within(eggCard()).getByTestId('egg-count');
const addEgg = (user: User) => user.click(within(eggCard()).getByRole('button', { name: 'Dodaj jajko' }));
const removeEgg = (user: User) => user.click(within(eggCard()).getByRole('button', { name: 'Odejmij jajko' }));

async function addEggs(user: User, n: number) {
  for (let i = 0; i < n; i++) await addEgg(user);
}

describe('Egg Count', () => {
  it('counts eggs with +/− buttons and never goes below zero', async () => {
    const { user } = renderApp();
    await setUpFlock(user, { hens: 5, roosters: 1 });

    expect(eggCountValue()).toHaveTextContent('0');
    await removeEgg(user);
    expect(eggCountValue()).toHaveTextContent('0');

    await addEggs(user, 3);
    await removeEgg(user);
    expect(eggCountValue()).toHaveTextContent('2');
  });

  it('keeps the Egg Count after reopening the app and lets it be changed again', async () => {
    const first = renderApp({ today: '2026-11-11' });
    await setUpFlock(first.user, { hens: 5, roosters: 1 });
    await addEggs(first.user, 2);
    first.unmount();

    const second = renderApp({ today: '2026-11-11', storage: first.storage });
    expect(eggCountValue()).toHaveTextContent('2');

    await addEgg(second.user);
    second.unmount();

    renderApp({ today: '2026-11-11', storage: first.storage });
    expect(eggCountValue()).toHaveTextContent('3');
  });

  it("creates today's Day Entry with a snapshot of the Flock when eggs are first recorded", async () => {
    const { user, storage } = renderApp({ today: '2026-11-11' });
    await setUpFlock(user, { hens: 5, roosters: 1 });
    expect(storage.load().dayEntries).toEqual({});

    await addEgg(user);

    expect(storage.load().dayEntries['2026-11-11']).toEqual({
      flock: { hens: 5, roosters: 1 },
      eggCount: 1,
    });
  });

  it('rates the same Egg Count as great in November and poor in May', async () => {
    const november = renderApp({ today: '2026-11-11' });
    await setUpFlock(november.user, { hens: 5, roosters: 1 });
    await addEggs(november.user, 2);
    // 5 hens × 0.25 = 1.25 expected; 2 / 1.25 = 1.6
    expect(within(eggCard()).getByText('Oczekiwane: 1,3')).toBeInTheDocument();
    expect(within(eggCard()).getByText('Ocena: świetnie')).toBeInTheDocument();
    november.unmount();

    const may = renderApp({ today: '2026-05-11' });
    await setUpFlock(may.user, { hens: 5, roosters: 1 });
    await addEggs(may.user, 2);
    // 5 hens × 0.80 = 4 expected; 2 / 4 = 0.5
    expect(within(eggCard()).getByText('Oczekiwane: 4')).toBeInTheDocument();
    expect(within(eggCard()).getByText('Ocena: słabo')).toBeInTheDocument();
  });

  it('rates exactly 60% and exactly 120% of Expected Eggs as normal', async () => {
    // 20 hens × 0.25 (November) = 5 expected
    const { user } = renderApp({ today: '2026-11-11' });
    await setUpFlock(user, { hens: 20, roosters: 0 });
    const rating = () => within(eggCard()).getByText(/^Ocena:/);

    await addEggs(user, 2);
    expect(rating()).toHaveTextContent('Ocena: słabo');
    await addEgg(user); // 3 = 60%
    expect(rating()).toHaveTextContent('Ocena: norma');
    await addEggs(user, 3); // 6 = 120%
    expect(rating()).toHaveTextContent('Ocena: norma');
    await addEgg(user); // 7 = 140%
    expect(rating()).toHaveTextContent('Ocena: świetnie');
  });

  it('shows no Egg Rating when the Flock has no hens', async () => {
    const { user } = renderApp({ today: '2026-05-11' });
    await setUpFlock(user, { hens: 0, roosters: 2 });
    await addEgg(user);

    expect(within(eggCard()).getByText('Oczekiwane: 0')).toBeInTheDocument();
    expect(within(eggCard()).queryByText(/^Ocena:/)).not.toBeInTheDocument();
  });

  it('starts a new day at zero eggs', async () => {
    const first = renderApp({ today: '2026-11-11' });
    await setUpFlock(first.user, { hens: 5, roosters: 1 });
    await addEggs(first.user, 2);
    first.unmount();

    renderApp({ today: '2026-11-12', storage: first.storage });
    expect(eggCountValue()).toHaveTextContent('0');
  });
});
