# 10: Shared data in Firestore

**What to build:** The Flock and Day Entries live in Firestore under the signed-in Household Account, so both Keepers see and edit the same data. A change made on one phone appears on the other without refreshing. Two Keepers editing different parts of the same day (one the Egg Count, the other the Closing) never overwrite each other. Entries made without signal are kept and sync when the phone reconnects.

The storage seam changes from load/save of the whole state to subscribe + granular writes (save Flock, save Closing for a date, save Egg Count for a date — each also setting the Day Entry's Flock snapshot when it is created). The in-memory implementation is updated to the new interface and keeps backing the tests; the localStorage adapter is removed.

See `.scratch/kury-prototype/spec.md` (Amendment 1, stories 43–45) and `docs/adr/0001-firebase-for-shared-household-data.md`.

**Blocked by:** 09 (Sign in with the Household Account)

**Status:** done

- [x] Storage seam is subscribe + granular writes; screens render from the subscribed state
- [x] In-memory storage implements the new interface; all existing tests pass on it
- [x] Test: a change written to storage from outside the UI (simulating the other Keeper) appears on screen without remounting
- [x] Test: saving the Egg Count and saving the Closing for the same day both survive, in either order
- [x] Firestore adapter: one Flock document and one document per Day Entry (keyed by date) under the account's uid; writes merge only the changed fields
- [x] Firestore offline persistence enabled (persistent local cache)
- [x] `firestore.rules` allows reads and writes only to the signed-in account's own documents; `firebase.json` references it
- [ ] Manual check (after 08): two browsers signed in to the same account see each other's changes live
