# 11: Deploy to Firebase Hosting

**What to build:** The app is live at the project's `https://<project>.web.app` address. Both parents open it on their phones, sign in with the Household Account, and add it to the home screen. Replaces ticket 07.

See `.scratch/kury-prototype/spec.md` (Amendment 1, story 46).

**Blocked by:** 08 (Firebase project setup), 09 (Sign in with the Household Account), 10 (Shared data in Firestore)

**Status:** ready-for-human

- [ ] `firebase.json` configures Hosting to serve the production build (`dist/`) as a single-page app
- [ ] `npm run build && firebase deploy` publishes Hosting and the Firestore rules
- [ ] Both phones open the public URL, sign in, and add the app to the home screen
- [ ] An entry made on one phone shows up on the other
- [ ] README explains how to deploy and how to change the Household Account password in the console
