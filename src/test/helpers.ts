import { screen, within } from '@testing-library/react';
import type { AppState, Flock } from '../domain';
import { createMemoryStorage } from '../storage';
import { renderApp } from './renderApp';

export type User = ReturnType<typeof renderApp>['user'];

/** Fills in and saves the Flock form (first-launch setup or Settings). */
export async function submitFlockForm(user: User, { hens, roosters }: Flock) {
  await user.clear(screen.getByLabelText('Kury'));
  await user.type(screen.getByLabelText('Kury'), String(hens));
  await user.clear(screen.getByLabelText('Koguty'));
  await user.type(screen.getByLabelText('Koguty'), String(roosters));
  await user.click(screen.getByRole('button', { name: 'Zapisz' }));
}

/** In-memory storage with the Flock already set up. */
export function storageWithFlock(flock: Flock, dayEntries: AppState['dayEntries'] = {}) {
  return createMemoryStorage({ flock, dayEntries });
}

/** Opens the app on the Today screen with an already configured Flock. */
export function renderToday(flock: Flock, today = '2026-11-11') {
  return renderApp({ today, storage: storageWithFlock(flock) });
}

export const nav = () => within(screen.getByRole('navigation', { name: 'Nawigacja' }));
export const eggCard = () => within(screen.getByRole('region', { name: 'Jajka' }));
export const closingCard = () => within(screen.getByRole('region', { name: 'Zamknięcie kurnika' }));
