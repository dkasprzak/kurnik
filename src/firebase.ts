import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  AuthErrorCodes,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { SignInError, type AuthAdapter, type SignInFailure } from './auth';

/** Reads the Firebase web config from `VITE_FIREBASE_*` variables (see `.env.example`). */
export function firebaseConfigFromEnv(env: ImportMetaEnv): FirebaseOptions {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config (${missing.join(', ')}); copy .env.example to .env.local and fill it in.`);
  }
  return config;
}

export function createFirebaseApp(config: FirebaseOptions): FirebaseApp {
  return initializeApp(config);
}

const FAILURES: Record<string, SignInFailure> = {
  [AuthErrorCodes.INVALID_LOGIN_CREDENTIALS]: 'wrong-credentials',
  [AuthErrorCodes.INVALID_PASSWORD]: 'wrong-credentials',
  [AuthErrorCodes.USER_DELETED]: 'wrong-credentials',
  [AuthErrorCodes.INVALID_EMAIL]: 'wrong-credentials',
  [AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER]: 'too-many-attempts',
  [AuthErrorCodes.NETWORK_REQUEST_FAILED]: 'network',
};

/** Firebase Authentication (email/password) with the session kept on the device. */
export function createFirebaseAuth(app: FirebaseApp): AuthAdapter {
  const auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
  return {
    onAccountChange: (listener) => onAuthStateChanged(auth, (user) => listener(user ? { uid: user.uid } : null)),
    async signIn(email, password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        const code = (error as { code?: string }).code ?? '';
        throw new SignInError(FAILURES[code] ?? 'unknown');
      }
    },
    signOut: () => signOut(auth),
  };
}
