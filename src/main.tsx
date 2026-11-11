import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createFirebaseApp, createFirebaseAuth, firebaseConfigFromEnv } from './firebase';
import { createFirestore, createFirestoreStorage } from './firestoreStorage';
import './styles.css';

// Firebase is created only here, so tests (which inject fakes) never need the env variables.
const firebaseApp = createFirebaseApp(firebaseConfigFromEnv(import.meta.env));
const auth = createFirebaseAuth(firebaseApp);
const db = createFirestore(firebaseApp);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App auth={auth} openStorage={(account) => createFirestoreStorage(db, account.uid)} />
  </StrictMode>,
);
