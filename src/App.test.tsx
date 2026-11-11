import { screen } from '@testing-library/react';
import { renderApp } from './test/renderApp';

describe('Flock setup', () => {
  it('asks for the number of hens and roosters on first launch', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /twoje stado/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Kury')).toBeInTheDocument();
    expect(screen.getByLabelText('Koguty')).toBeInTheDocument();
  });

  it('shows the configured Flock on the Today screen after saving', async () => {
    const { user } = renderApp();

    await setUpFlock(user, { hens: 5, roosters: 1 });

    expect(screen.getByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
    expect(screen.getByText('5 kur, 1 kogut')).toBeInTheDocument();
  });

  it('accepts a Flock with no roosters', async () => {
    const { user } = renderApp();

    await setUpFlock(user, { hens: 4, roosters: 0 });

    expect(screen.getByText('4 kury, 0 kogutów')).toBeInTheDocument();
  });

  it('rejects a Flock with zero hens and zero roosters', async () => {
    const { user } = renderApp();

    await setUpFlock(user, { hens: 0, roosters: 0 });

    expect(screen.getByRole('alert')).toHaveTextContent('Stado musi mieć co najmniej jednego ptaka.');
    expect(screen.getByRole('heading', { name: /twoje stado/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dziś' })).not.toBeInTheDocument();
  });

  it('skips setup on later launches and shows the saved Flock', async () => {
    const first = renderApp();
    await setUpFlock(first.user, { hens: 3, roosters: 2 });
    first.unmount();

    renderApp({ storage: first.storage });

    expect(screen.queryByRole('heading', { name: /twoje stado/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
    expect(screen.getByText('3 kury, 2 koguty')).toBeInTheDocument();
  });
});

describe('Today screen', () => {
  it("shows today's date from the clock", async () => {
    const { user } = renderApp({ today: '2026-05-03' });

    await setUpFlock(user, { hens: 5, roosters: 1 });

    expect(screen.getByText('niedziela, 3 maja 2026')).toBeInTheDocument();
  });
});

type User = ReturnType<typeof renderApp>['user'];

async function setUpFlock(user: User, { hens, roosters }: { hens: number; roosters: number }) {
  await user.clear(screen.getByLabelText('Kury'));
  await user.type(screen.getByLabelText('Kury'), String(hens));
  await user.clear(screen.getByLabelText('Koguty'));
  await user.type(screen.getByLabelText('Koguty'), String(roosters));
  await user.click(screen.getByRole('button', { name: 'Zapisz' }));
}
