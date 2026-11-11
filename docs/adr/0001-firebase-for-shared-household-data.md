# Firebase for shared household data

The app is used by two Keepers (parents) on separate phones who must see and edit the same Flock and Day Entries, so browser-only localStorage is no longer enough. We chose Firebase — Authentication with one shared email/password Household Account, Firestore in `europe-central2` with offline persistence and realtime listeners, and Firebase Hosting — because it gives sync, offline writes (the coop has poor signal) and one-command deploy on the free Spark plan, with no server to maintain.

## Considered Options

- **Supabase + Netlify/Vercel**: similar effort, but free projects pause after a week of inactivity and offline writes would be hand-rolled.
- **Self-hosted backend (e.g. PocketBase)**: full control, but a server to host and maintain is overkill for a family app.

## Consequences

- Data is stored as one Firestore document per Day Entry plus one for the Flock, written field by field, so two Keepers editing different parts of the same day (Egg Count vs Closing) never overwrite each other; the same field edited by both resolves last-write-wins.
- There is no sign-up flow: the Household Account is created by hand in the Firebase console.
- Tests keep using the in-memory storage behind the same seam; the Firestore adapter is verified manually on the phones (no emulator, which would need Java).
