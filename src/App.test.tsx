import { screen } from '@testing-library/react';
import { renderApp } from './test/renderApp';
import { submitFlockForm } from './test/helpers';

describe('Flock setup', () => {
  it('asks for the number of hens and roosters on first launch', () => {
    renderApp({ signedIn: true });

    expect(screen.getByRole('heading', { name: /twoje stado/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Kury')).toBeInTheDocument();
    expect(screen.getByLabelText('Koguty')).toBeInTheDocument();
  });

  it('shows the configured Flock on the Today screen after saving', async () => {
    const { user } = renderApp({ signedIn: true });

    await submitFlockForm(user, { hens: 5, roosters: 1 });

    expect(screen.getByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
    expect(screen.getByText('5 kur, 1 kogut')).toBeInTheDocument();
  });

  it('accepts a Flock with no roosters', async () => {
    const { user } = renderApp({ signedIn: true });

    await submitFlockForm(user, { hens: 4, roosters: 0 });

    expect(screen.getByText('4 kury, 0 kogutów')).toBeInTheDocument();
  });

  it('rejects a Flock with zero hens and zero roosters', async () => {
    const { user } = renderApp({ signedIn: true });

    await submitFlockForm(user, { hens: 0, roosters: 0 });

    expect(screen.getByRole('alert')).toHaveTextContent('Stado musi mieć co najmniej jednego ptaka.');
    expect(screen.getByRole('heading', { name: /twoje stado/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dziś' })).not.toBeInTheDocument();
  });

  it('skips setup on later launches and shows the saved Flock', async () => {
    const first = renderApp({ signedIn: true });
    await submitFlockForm(first.user, { hens: 3, roosters: 2 });
    first.unmount();

    renderApp({ signedIn: true, storage: first.storage });

    expect(screen.queryByRole('heading', { name: /twoje stado/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
    expect(screen.getByText('3 kury, 2 koguty')).toBeInTheDocument();
  });
});

describe('Today screen', () => {
  it("shows today's date from the clock", async () => {
    const { user } = renderApp({ signedIn: true, today: '2026-05-03' });

    await submitFlockForm(user, { hens: 5, roosters: 1 });

    expect(screen.getByText('niedziela, 3 maja 2026')).toBeInTheDocument();
  });
});
