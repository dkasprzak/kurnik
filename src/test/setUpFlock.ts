import { screen } from '@testing-library/react';
import type { renderApp } from './renderApp';

type User = ReturnType<typeof renderApp>['user'];

/** Fills in and saves the first-launch Flock setup form. */
export async function setUpFlock(user: User, { hens, roosters }: { hens: number; roosters: number }) {
  await user.clear(screen.getByLabelText('Kury'));
  await user.type(screen.getByLabelText('Kury'), String(hens));
  await user.clear(screen.getByLabelText('Koguty'));
  await user.type(screen.getByLabelText('Koguty'), String(roosters));
  await user.click(screen.getByRole('button', { name: 'Zapisz' }));
}
