# 03: Egg Count with Egg Rating on the Today screen

**What to build:** The Today screen gets an Egg Count card with large +/− buttons, usable before or after the Closing and editable throughout the day. Below the count the keeper sees today's Expected Eggs and an Egg Rating (słabo / norma / świetnie), computed from the hens in today's Flock and the month's Laying Rate. Saving the Egg Count creates today's Day Entry (with a Flock snapshot) if it does not exist yet.

Laying Rate by month (fixed): Jan 0.30, Feb 0.40, Mar 0.65, Apr 0.80, May 0.80, Jun 0.75, Jul 0.70, Aug 0.65, Sep 0.55, Oct 0.40, Nov 0.25, Dec 0.25. Expected Eggs = hens in the Day Entry's Flock × Laying Rate. Egg Rating: ratio < 0.6 → słabo, 0.6–1.2 inclusive → norma, > 1.2 → świetnie. No rating with zero hens.

See `.scratch/kury-prototype/spec.md` (stories 18–26) and `GLOSSARY.md`.

**Blocked by:** 01 (App skeleton and Flock setup)

**Status:** done

- [x] Egg Count card shows large +/− buttons; the count cannot go below zero
- [x] The Egg Count is saved independently of the Closing and can be changed repeatedly during the day
- [x] Saving creates today's Day Entry with a Flock snapshot if it does not exist yet (reuse the Day Entry from 02 if it has landed)
- [x] Expected Eggs for today are shown, based on the hens in the Flock (not those counted at Closing)
- [x] Egg Rating is shown with the thresholds above; no rating when the Flock has zero hens
- [x] Tests with the fake clock show the same Egg Count rated differently in November and in May
- [x] Threshold edges (exactly 60% and 120%) are covered, via the UI or, if awkward, a direct test of the pure domain module
- [x] The Egg Count survives remounting `<App>` with the same storage (tested)
