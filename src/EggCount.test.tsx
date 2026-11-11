import { renderApp } from './test/renderApp';
import { eggCard, submitFlockForm, type User } from './test/helpers';

const eggCountValue = () => eggCard().getByLabelText('Jajka dziś');
const addEgg = (user: User) => user.click(eggCard().getByRole('button', { name: 'Dodaj jajko' }));
const removeEgg = (user: User) => user.click(eggCard().getByRole('button', { name: 'Odejmij jajko' }));

async function addEggs(user: User, n: number) {
  for (let i = 0; i < n; i++) await addEgg(user);
}

const recordZero = (user: User) => user.click(eggCard().getByRole('button', { name: 'Dziś 0 jaj' }));
const rating = () => eggCard().queryByText(/^Ocena:/);

describe('Egg Count', () => {
  it('shows no Egg Count and no Egg Rating before anything is recorded', async () => {
    const { user, storage } = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(user, { hens: 5, roosters: 1 });

    expect(eggCountValue()).toHaveTextContent('—');
    expect(eggCard().getByText('Oczekiwane: 1,3')).toBeInTheDocument();
    expect(rating()).not.toBeInTheDocument();
    expect(eggCard().getByRole('button', { name: 'Odejmij jajko' })).toBeDisabled();
    expect(storage.current().dayEntries).toEqual({});
  });

  it('records 1 egg on the first tap of +', async () => {
    const { user, storage } = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(user, { hens: 5, roosters: 1 });

    await addEgg(user);

    expect(eggCountValue()).toHaveTextContent('1');
    expect(storage.current().dayEntries['2026-11-11'].eggCount).toBe(1);
  });

  it('records zero eggs explicitly, with an Egg Rating', async () => {
    const { user, storage } = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(user, { hens: 5, roosters: 1 });

    await recordZero(user);

    expect(eggCountValue()).toHaveTextContent('0');
    expect(rating()).toHaveTextContent('Ocena: słabo');
    expect(storage.current().dayEntries['2026-11-11'].eggCount).toBe(0);
    expect(eggCard().getByRole('button', { name: 'Odejmij jajko' })).toBeDisabled();
    expect(eggCard().queryByRole('button', { name: 'Dziś 0 jaj' })).not.toBeInTheDocument();
  });

  it('counts eggs with +/− buttons and never goes below zero', async () => {
    const { user } = renderApp({ signedIn: true });
    await submitFlockForm(user, { hens: 5, roosters: 1 });

    await addEggs(user, 3);
    await removeEgg(user);
    expect(eggCountValue()).toHaveTextContent('2');

    await removeEgg(user);
    await removeEgg(user);
    expect(eggCountValue()).toHaveTextContent('0');
    expect(eggCard().getByRole('button', { name: 'Odejmij jajko' })).toBeDisabled();
  });

  it('keeps the Egg Count after reopening the app and lets it be changed again', async () => {
    const first = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(first.user, { hens: 5, roosters: 1 });
    await addEggs(first.user, 2);
    first.unmount();

    const second = renderApp({ signedIn: true, today: '2026-11-11', storage: first.storage });
    expect(eggCountValue()).toHaveTextContent('2');

    await addEgg(second.user);
    second.unmount();

    renderApp({ signedIn: true, today: '2026-11-11', storage: first.storage });
    expect(eggCountValue()).toHaveTextContent('3');
  });

  it("creates today's Day Entry with a snapshot of the Flock when eggs are first recorded", async () => {
    const { user, storage } = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(user, { hens: 5, roosters: 1 });
    expect(storage.current().dayEntries).toEqual({});

    await addEgg(user);

    expect(storage.current().dayEntries['2026-11-11']).toEqual({
      flock: { hens: 5, roosters: 1 },
      eggCount: 1,
    });
  });

  it('rates the same Egg Count as great in November and poor in May', async () => {
    const november = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(november.user, { hens: 5, roosters: 1 });
    await addEggs(november.user, 2);
    // 5 hens × 0.25 = 1.25 expected; 2 / 1.25 = 1.6
    expect(eggCard().getByText('Oczekiwane: 1,3')).toBeInTheDocument();
    expect(eggCard().getByText('Ocena: świetnie')).toBeInTheDocument();
    november.unmount();

    const may = renderApp({ signedIn: true, today: '2026-05-11' });
    await submitFlockForm(may.user, { hens: 5, roosters: 1 });
    await addEggs(may.user, 2);
    // 5 hens × 0.80 = 4 expected; 2 / 4 = 0.5
    expect(eggCard().getByText('Oczekiwane: 4')).toBeInTheDocument();
    expect(eggCard().getByText('Ocena: słabo')).toBeInTheDocument();
  });

  it('rates exactly 60% and exactly 120% of Expected Eggs as normal', async () => {
    // 20 hens × 0.25 (November) = 5 expected
    const { user } = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(user, { hens: 20, roosters: 0 });
    const rating = () => eggCard().getByText(/^Ocena:/);

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
    const { user } = renderApp({ signedIn: true, today: '2026-05-11' });
    await submitFlockForm(user, { hens: 0, roosters: 2 });
    await addEgg(user);

    expect(eggCard().getByText('Oczekiwane: 0')).toBeInTheDocument();
    expect(eggCard().queryByText(/^Ocena:/)).not.toBeInTheDocument();
  });

  it('starts a new day with no Egg Count recorded', async () => {
    const first = renderApp({ signedIn: true, today: '2026-11-11' });
    await submitFlockForm(first.user, { hens: 5, roosters: 1 });
    await addEggs(first.user, 2);
    first.unmount();

    renderApp({ signedIn: true, today: '2026-11-12', storage: first.storage });
    expect(eggCountValue()).toHaveTextContent('—');
    expect(rating()).not.toBeInTheDocument();
  });
});
