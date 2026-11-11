import { screen } from '@testing-library/react';
import type { MemoryStorage } from './storage';
import { renderApp } from './test/renderApp';
import { closingCard, nav, storageWithFlock, submitFlockForm, type User } from './test/helpers';

async function openSettings(user: User) {
  await user.click(nav().getByRole('button', { name: 'Ustawienia' }));
}

async function openToday(user: User) {
  await user.click(nav().getByRole('button', { name: 'Dziś' }));
}

function renderWith(storage: MemoryStorage, today = '2026-11-11') {
  return renderApp({ signedIn: true, today, storage });
}

describe('Settings', () => {
  it('switches between Today and Settings with the bottom navigation', async () => {
    const { user } = renderWith(storageWithFlock({ hens: 5, roosters: 1 }));

    await openSettings(user);
    expect(screen.getByRole('heading', { name: 'Ustawienia' })).toBeInTheDocument();
    expect(nav().getByRole('button', { name: 'Ustawienia' })).toHaveAttribute('aria-current', 'page');

    await openToday(user);
    expect(screen.getByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
    expect(nav().getByRole('button', { name: 'Dziś' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows the current Flock in the form', async () => {
    const { user } = renderWith(storageWithFlock({ hens: 5, roosters: 1 }));

    await openSettings(user);

    expect(screen.getByLabelText('Kury')).toHaveValue(5);
    expect(screen.getByLabelText('Koguty')).toHaveValue(1);
  });

  it('rejects an empty Flock and keeps the old one', async () => {
    const storage = storageWithFlock({ hens: 5, roosters: 1 });
    const { user } = renderWith(storage);

    await openSettings(user);
    await submitFlockForm(user, { hens: 0, roosters: 0 });

    expect(screen.getByRole('alert')).toHaveTextContent('Stado musi mieć co najmniej jednego ptaka.');
    expect(storage.current().flock).toEqual({ hens: 5, roosters: 1 });
  });

  it('prefills the Closing steppers with the new Flock after saving', async () => {
    const { user } = renderWith(storageWithFlock({ hens: 5, roosters: 1 }));

    await openSettings(user);
    await submitFlockForm(user, { hens: 7, roosters: 2 });
    expect(screen.getByRole('status')).toHaveTextContent('Zapisano: 7 kur, 2 koguty');
    await openToday(user);

    expect(closingCard().getByLabelText('Kury w kurniku')).toHaveTextContent('7');
    expect(closingCard().getByLabelText('Koguty w kurniku')).toHaveTextContent('2');
  });

  it('keeps the new Flock after the app is reopened', async () => {
    const storage = storageWithFlock({ hens: 5, roosters: 1 });
    const first = renderWith(storage);
    await openSettings(first.user);
    await submitFlockForm(first.user, { hens: 3, roosters: 0 });
    first.unmount();

    const { user } = renderWith(storage);
    await openSettings(user);

    expect(screen.getByLabelText('Kury')).toHaveValue(3);
    expect(screen.getByLabelText('Koguty')).toHaveValue(0);
  });

  it('keeps the Shortfall of a past Day Entry recorded with the old Flock', async () => {
    const storage = storageWithFlock({ hens: 5, roosters: 1 });

    // Yesterday: close with one hen missing from the 5-hen Flock.
    const yesterday = renderWith(storage, '2026-11-10');
    await yesterday.user.click(closingCard().getByRole('button', { name: 'Mniej kur' }));
    await yesterday.user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));
    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 1 kury');
    yesterday.unmount();

    // Today: the keeper grows the Flock to 8 hens.
    const today = renderWith(storage, '2026-11-11');
    await openSettings(today.user);
    await submitFlockForm(today.user, { hens: 8, roosters: 1 });
    today.unmount();

    // Yesterday's Day Entry is still compared against yesterday's Flock.
    renderWith(storage, '2026-11-10');
    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 1 kury');
    expect(closingCard().getByRole('alert')).not.toHaveTextContent('Brakuje 4 kur');
  });

  it("updates today's Day Entry snapshot and uses the new Flock on a fresh day", async () => {
    const storage = storageWithFlock({ hens: 5, roosters: 1 });
    const { user, unmount } = renderWith(storage, '2026-11-11');

    await user.click(closingCard().getByRole('button', { name: 'Zamknij kurnik' }));
    await openSettings(user);
    await submitFlockForm(user, { hens: 6, roosters: 1 });
    await openToday(user);
    // Today's Closing of 5 hens is now compared against the new 6-hen Flock.
    expect(closingCard().getByRole('alert')).toHaveTextContent('Brakuje 1 kury');
    unmount();

    renderWith(storage, '2026-11-12');
    expect(closingCard().getByLabelText('Kury w kurniku')).toHaveTextContent('6');
  });
});
