import type { FirebaseApp } from 'firebase/app';
import {
  collection,
  doc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { AppState, DayEntry, Flock } from './domain';
import type { AppStorage } from './storage';

/** Firestore with the offline cache kept on the device, so entries made without signal sync later. */
export function createFirestore(app: FirebaseApp): Firestore {
  return initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

/** The Household document (`households/{uid}`) holds the Flock. */
type HouseholdDoc = { flock?: Flock };

/**
 * Household data in Firestore: `households/{uid}` holds the Flock and
 * `households/{uid}/dayEntries/{YYYY-MM-DD}` holds one Day Entry. Writes merge only the changed fields.
 */
export function createFirestoreStorage(db: Firestore, uid: string): AppStorage {
  const householdRef = doc(db, 'households', uid);
  const dayEntriesRef = collection(householdRef, 'dayEntries');

  return {
    subscribe(listener) {
      let flock: Flock | undefined;
      let dayEntries: AppState['dayEntries'] | undefined;
      let householdLoaded = false;
      const emit = () => {
        if (householdLoaded && dayEntries) listener({ flock, dayEntries });
      };
      const onError = (error: Error) => console.error('Firestore listener failed', error);

      const unsubscribeHousehold = onSnapshot(
        householdRef,
        (snapshot) => {
          flock = (snapshot.data() as HouseholdDoc | undefined)?.flock;
          householdLoaded = true;
          emit();
        },
        onError,
      );
      const unsubscribeDays = onSnapshot(
        dayEntriesRef,
        (snapshot) => {
          const next: AppState['dayEntries'] = {};
          snapshot.forEach((day) => {
            next[day.id] = day.data() as DayEntry;
          });
          dayEntries = next;
          emit();
        },
        onError,
      );
      return () => {
        unsubscribeHousehold();
        unsubscribeDays();
      };
    },

    write(change) {
      const batch = writeBatch(db);
      if (change.flock) batch.set(householdRef, { flock: change.flock } satisfies HouseholdDoc, { merge: true });
      for (const [date, patch] of Object.entries(change.dayEntries ?? {})) {
        batch.set(doc(dayEntriesRef, date), patch, { merge: true });
      }
      // Not awaited: offline the promise only settles after reconnecting, while
      // the listeners already show the pending write from the local cache.
      batch.commit().catch((error: unknown) => console.error('Firestore write failed', error));
    },
  };
}
