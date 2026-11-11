import { screen } from '@testing-library/react';
import { renderApp } from './test/renderApp';
import { closingCard, eggCard, renderToday } from './test/helpers';

describe('Closing', () => {
  it('prefills the hen and rooster steppers with the full Flock', () => {
    renderToday({ hens: 5, roosters: 1 });

    expect(closingCard().getByLabelText('Kury w kurniku')).toHaveTextContent('5');
    expect(closingCard().getByLabelText('Koguty w kurniku')).toHaveTextContent('1');
  });

  it('lets the keeper lower and raise the counts with +/− buttons', async () => {
    const { user } = renderToday({ hens: 5, roosters: 1 });

    await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Więcej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Więcej kogutów' }));

    expect(closingCard().getByLabelText('Kury w kurniku')).toHaveTextContent('4');
    expect(closingCard().getByLabelText('Koguty w kurniku')).toHaveTextContent('2');
  });

  it('never lets a count go below zero', async () => {
    const { user } = renderToday({ hens: 1, roosters: 1 });

    await user.click(closingCard().getByRole('button', { name: 'Mniej kogutów' }));
    await user.click(closingCard().getByRole('button', { name: 'Mniej kogutów' }));

    expect(closingCard().getByLabelText('Koguty w kurniku')).toHaveTextContent('0');
  });

  it('hides the rooster stepper when the Flock has no roosters', () => {
    renderToday({ hens: 4, roosters: 0 });

    expect(closingCard().getByLabelText('Kury w kurniku')).toHaveTextContent('4');
    expect(closingCard().queryByLabelText('Koguty w kurniku')).not.toBeInTheDocument();
    expect(closingCard().queryByRole('button', { name: 'Więcej kogutów' })).not.toBeInTheDocument();
  });

  it('shows "all in" after closing with the full Flock in a single tap', async () => {
    const { user } = renderToday({ hens: 5, roosters: 1 });

    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    expect(closingCard().getByText('Wszystkie ptaki w kurniku')).toBeInTheDocument();
    expect(closingCard().queryByRole('alert')).not.toBeInTheDocument();
  });

  it('highlights a Shortfall per bird type when fewer birds were counted', async () => {
    const { user } = renderToday({ hens: 5, roosters: 1 });

    await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Mniej kogutów' }));
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    const shortfall = closingCard().getByRole('alert');
    expect(shortfall).toHaveTextContent('Brakuje 1 kury');
    expect(shortfall).toHaveTextContent('Brakuje koguta');
    expect(closingCard().queryByText('Wszystkie ptaki w kurniku')).not.toBeInTheDocument();
  });

  it('uses the plural form for a Shortfall of several hens', async () => {
    const { user } = renderToday({ hens: 6, roosters: 0 });

    for (let i = 0; i < 5; i++) {
      await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    }
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 5 kur');
  });

  it('shows no Shortfall when more birds than the Flock were counted', async () => {
    const { user } = renderToday({ hens: 3, roosters: 1 });

    await user.click(closingCard().getByRole('button', { name: 'Więcej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    expect(closingCard().getByText('Wszystkie ptaki w kurniku')).toBeInTheDocument();
    expect(closingCard().queryByRole('alert')).not.toBeInTheDocument();
  });

  it('leaves the Flock unchanged after a Shortfall', async () => {
    const { user, storage } = renderToday({ hens: 5, roosters: 1 });

    await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    expect(screen.getByText('5 kur, 1 kogut')).toBeInTheDocument();
    expect(storage.current().flock).toEqual({ hens: 5, roosters: 1 });
  });

  it("saves the Closing into today's Day Entry with a snapshot of the Flock", async () => {
    const { user, storage } = renderToday({ hens: 5, roosters: 1 }, '2026-05-03');

    await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    expect(storage.current().dayEntries['2026-05-03']).toEqual({
      flock: { hens: 5, roosters: 1 },
      closing: { hens: 4, roosters: 1 },
    });
  });

  it('keeps the saved Closing after reopening the app', async () => {
    const first = renderToday({ hens: 5, roosters: 1 });
    await first.user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await first.user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));
    first.unmount();

    renderApp({ signedIn: true, today: '2026-11-11', storage: first.storage });

    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 1 kury');
  });

  it('bases Expected Eggs on the Flock, not on the hens counted at Closing', async () => {
    // May: 5 hens × 0.80 = 4 expected, even though only 1 hen was counted.
    const { user } = renderToday({ hens: 5, roosters: 0 }, '2026-05-11');
    for (let i = 0; i < 4; i++) {
      await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    }
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));
    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 4 kur');

    for (let i = 0; i < 4; i++) {
      await user.click(eggCard().getByRole('button', { name: 'Dodaj jajko' }));
    }

    expect(eggCard().getByText('Oczekiwane: 4')).toBeInTheDocument();
    expect(eggCard().getByText('Ocena: norma')).toBeInTheDocument();
  });

  it('lets the keeper correct a saved Closing', async () => {
    const { user, storage } = renderToday({ hens: 5, roosters: 1 });
    await user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));

    await user.click(closingCard().getByRole('button', { name: 'Popraw' }));
    expect(closingCard().getByLabelText('Kury w kurniku')).toHaveTextContent('4');
    await user.click(closingCard().getByRole('button', { name: 'Więcej kur' }));
    await user.click(closingCard().getByRole('button', { name: 'Zapisz zamknięcie' }));

    expect(closingCard().getByText('Wszystkie ptaki w kurniku')).toBeInTheDocument();
    expect(storage.current().dayEntries['2026-11-11'].closing).toEqual({ hens: 5, roosters: 1 });
  });
});
