# 06: History summary for 7 and 30 days

**What to build:** Above the History list, a summary for the last 7 days and the last 30 days (counting back from today, inclusive): total eggs, average eggs per day, and the number of days with a Shortfall.

See `.scratch/kury-prototype/spec.md` (story 29) and `GLOSSARY.md`.

**Blocked by:** 05 (History list and day detail)

**Status:** done

- [x] Summary shows total eggs, average eggs per day and Shortfall day count for the last 7 days and the last 30 days
- [x] Average is total eggs divided by the number of days in the window that have an Egg Count (days without one are excluded); shown to one decimal
- [x] Entries outside the window are excluded (tested with the fake clock)
- [x] With no data, the summary shows zeros or a friendly empty state, never errors or NaN
