import { screen } from '@testing-library/react';
import { HOUSEHOLD_EMAIL, HOUSEHOLD_PASSWORD } from './test/fakeAuth';
import { nav, storageWithFlock, type User } from './test/helpers';
import { renderApp } from './test/renderApp';

async function signIn(user: User, email = HOUSEHOLD_EMAIL, password = HOUSEHOLD_PASSWORD) {
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Hasło'), password);
  await user.click(screen.getByRole('button', { name: 'Zaloguj' }));
}

describe('Sign in', () => {
  it('shows only the sign-in screen when signed out', () => {
    renderApp({ storage: storageWithFlock({ hens: 5, roosters: 1 }) });

    expect(screen.getByRole('heading', { name: 'Zaloguj się' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dziś' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Nawigacja' })).not.toBeInTheDocument();
  });

  it('shows Flock setup after signing in on first use', async () => {
    const { user } = renderApp();

    await signIn(user);

    expect(await screen.findByRole('heading', { name: /twoje stado/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Zaloguj się' })).not.toBeInTheDocument();
  });

  it('shows Today after signing in when the Flock is set up', async () => {
    const { user } = renderApp({ storage: storageWithFlock({ hens: 5, roosters: 1 }) });

    await signIn(user);

    expect(await screen.findByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
  });

  it('keeps the Keeper on the sign-in screen after a wrong password', async () => {
    const { user } = renderApp({ storage: storageWithFlock({ hens: 5, roosters: 1 }) });

    await signIn(user, HOUSEHOLD_EMAIL, 'zle-haslo');

    expect(await screen.findByRole('alert')).toHaveTextContent('Nieprawidłowy e-mail lub hasło.');
    expect(screen.getByRole('heading', { name: 'Zaloguj się' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dziś' })).not.toBeInTheDocument();
  });

  it('stays signed in after the app is reopened', async () => {
    const storage = storageWithFlock({ hens: 5, roosters: 1 });
    const first = renderApp({ storage });
    await signIn(first.user);
    await screen.findByRole('heading', { name: 'Dziś' });
    first.unmount();

    renderApp({ storage, auth: first.auth });

    expect(screen.getByRole('heading', { name: 'Dziś' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Zaloguj się' })).not.toBeInTheDocument();
  });

  it('signs out from Settings and returns to the sign-in screen', async () => {
    const { user, auth } = renderApp({ storage: storageWithFlock({ hens: 5, roosters: 1 }), signedIn: true });

    await user.click(nav().getByRole('button', { name: 'Ustawienia' }));
    await user.click(screen.getByRole('button', { name: 'Wyloguj' }));

    expect(await screen.findByRole('heading', { name: 'Zaloguj się' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Nawigacja' })).not.toBeInTheDocument();
    expect(auth.account).toBeNull();
  });
});
