/** The Household Account a Keeper is signed in to. */
export type Account = {
  /** Firebase uid; the Flock and Day Entries live under it. */
  uid: string;
};

export type SignInFailure = 'wrong-credentials' | 'too-many-attempts' | 'network' | 'unknown';

/** Thrown by `AuthAdapter.signIn` when the Keeper could not be signed in. */
export class SignInError extends Error {
  constructor(readonly reason: SignInFailure) {
    super(`Sign-in failed: ${reason}`);
    this.name = 'SignInError';
  }
}

/** Signs Keepers in to the shared Household Account. */
export interface AuthAdapter {
  /**
   * Calls `listener` with the current Account (or null when signed out) once it is known,
   * and again on every change. Returns a function that stops listening.
   */
  onAccountChange(listener: (account: Account | null) => void): () => void;
  /** Resolves once signed in; rejects with a `SignInError` otherwise. */
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
