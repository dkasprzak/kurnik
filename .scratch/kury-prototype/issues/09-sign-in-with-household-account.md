# 09: Sign in with the Household Account

**What to build:** Before anything else, the app shows a Polish sign-in screen (email + password). After signing in, the Keeper lands on the existing flow (Flock setup on first use, otherwise Today) and stays signed in across app restarts. Settings gets a "Wyloguj" button that returns to the sign-in screen. A wrong password shows a clear Polish message. Authentication goes through an injected auth seam (signed-in state, sign in, sign out), backed by Firebase Authentication in the real app and by a fake in tests.

See `.scratch/kury-prototype/spec.md` (Amendment 1, stories 40–42) and `GLOSSARY.md` (Keeper, Household Account).

**Blocked by:** None for the code and tests (fake auth). Manual check on a phone needs 08 (Firebase project setup).

**Status:** ready-for-agent

- [ ] `<App>` accepts an injected auth adapter; the real one wraps Firebase Authentication, configured from `VITE_FIREBASE_*` env variables
- [ ] The test render helper provides a fake auth (signed out by default, with a way to start signed in)
- [ ] Signed out: only the sign-in screen is shown; signing in with correct credentials shows Flock setup or Today
- [ ] Wrong credentials show a Polish error message and keep the Keeper on the sign-in screen
- [ ] Session persists across remount (fake auth state survives; real adapter uses Firebase's local persistence)
- [ ] "Wyloguj" in Settings signs out and shows the sign-in screen
- [ ] The app still builds and runs when env variables are missing in tests (adapter is only created in the real entry point)
