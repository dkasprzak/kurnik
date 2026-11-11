# 08: Firebase project setup

**What to build:** A Firebase project exists for the app, ready for the code tickets to connect to: Email/Password sign-in enabled with the single Household Account created, a Firestore database in `europe-central2`, a registered web app whose config values are in `.env.local` (not committed), and the Firebase CLI logged in on the dev machine. Only the human can do this (it needs their Google account), so it is walked through step by step, ideally with `/wizard`.

See `.scratch/kury-prototype/spec.md` (Amendment 1) and `docs/adr/0001-firebase-for-shared-household-data.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

- [ ] Firebase project created (free Spark plan)
- [ ] Authentication: Email/Password provider enabled; the Household Account (shared email + password) created in the console
- [ ] Firestore database created in `europe-central2` (production mode; rules come from ticket 10)
- [ ] Web app registered; its config values saved as `VITE_FIREBASE_*` variables in `.env.local`, and `.env.local` is git-ignored
- [ ] `npm i -g firebase-tools` and `firebase login` done on the dev machine
