# 04: Settings — change the Flock, plus bottom navigation

**What to build:** A bottom navigation bar (Dziś / Ustawienia) and a Settings screen where the keeper changes the number of Hens and Roosters. The new Flock applies from today onward: past Day Entries keep the Flock they were recorded with, so yesterday's Shortfall is still computed against yesterday's Flock.

See `.scratch/kury-prototype/spec.md` (stories 6–7, 39) and `GLOSSARY.md`.

**Blocked by:** 02 (Closing on the Today screen)

**Status:** ready-for-agent

- [ ] Bottom navigation bar switches between Today and Settings and is thumb-reachable
- [ ] Settings shows the current Flock and lets the keeper change hens and roosters, with the same validation as setup (no empty Flock)
- [ ] After saving, the Today screen's Closing steppers prefill with the new Flock
- [ ] Today's Day Entry, if not yet created, uses the new Flock; existing Day Entries keep their snapshot
- [ ] Test: a Day Entry recorded with the old Flock (fake clock on an earlier day) still shows the same Shortfall after the Flock changes
- [ ] The new Flock survives remounting `<App>` (tested)
