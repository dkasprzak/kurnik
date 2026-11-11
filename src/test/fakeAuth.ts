import { SignInError, type Account, type AuthAdapter } from '../auth';

export const HOUSEHOLD_EMAIL = 'dom@example.com';
export const HOUSEHOLD_PASSWORD = 'kury-haslo';
export const HOUSEHOLD_UID = 'household-uid';

export type FakeAuth = AuthAdapter & { readonly account: Account | null };

/**
 * In-memory auth with one Household Account. The session lives in the fake itself,
 * so reusing the same instance across remounts simulates a persisted session.
 */
export function createFakeAuth({ signedIn = false } = {}): FakeAuth {
  let account: Account | null = signedIn ? { uid: HOUSEHOLD_UID } : null;
  const listeners = new Set<(account: Account | null) => void>();
  const notify = () => listeners.forEach((listener) => listener(account));

  return {
    get account() {
      return account;
    },
    onAccountChange(listener) {
      listeners.add(listener);
      listener(account);
      return () => {
        listeners.delete(listener);
      };
    },
    async signIn(email, password) {
      if (email !== HOUSEHOLD_EMAIL || password !== HOUSEHOLD_PASSWORD) {
        throw new SignInError('wrong-credentials');
      }
      account = { uid: HOUSEHOLD_UID };
      notify();
    },
    async signOut() {
      account = null;
      notify();
    },
  };
}
