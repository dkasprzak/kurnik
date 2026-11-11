# 02: Closing on the Today screen

**What to build:** The Today screen gets a Closing card. The hen and rooster steppers start at the full Flock, so on a normal evening the keeper just taps "Zamknij kurnik". After closing, the card shows "all in" or a highlighted Shortfall naming the missing birds (e.g. "brakuje 1 kury", "brakuje koguta"). The Closing can be corrected afterwards. Saving the Closing creates today's Day Entry, which stores the Flock as it was today. A Shortfall never changes the Flock.

See `.scratch/kury-prototype/spec.md` (stories 8–17) and `GLOSSARY.md`.

**Blocked by:** 01 (App skeleton and Flock setup)

**Status:** done

- [x] Closing card shows large +/− steppers for hens and roosters, prefilled with the Flock
- [x] Counts cannot go below zero; counts above the Flock are allowed and produce no Shortfall
- [x] The rooster stepper is hidden when the Flock has zero roosters
- [x] "Zamknij kurnik" saves the Closing into today's Day Entry, creating it with a snapshot of the current Flock if it does not exist
- [x] After closing, the card shows "all in" when counts match, or a highlighted Shortfall per bird type when fewer were counted
- [x] The Flock is unchanged after a Shortfall
- [x] The saved Closing can be edited and re-saved
- [x] The Closing survives remounting `<App>` with the same storage (tested)
