# 05: History list and day detail

**What to build:** A "Historia" tab listing Day Entries newest first, each row showing the date, Egg Count with its Egg Rating, and Closing status (all in / Shortfall / not closed). Tapping a day opens a day detail screen with the same Closing and Egg Count cards as Today, where the keeper can fill in or correct that day. Expected Eggs and Egg Rating for a past day use that Day Entry's Flock and that day's month. The keeper can also open a past day that has no entry yet (e.g. yesterday) to backfill it; future dates are not available.

See `.scratch/kury-prototype/spec.md` (stories 27–28, 30–34) and `GLOSSARY.md`.

**Blocked by:** 02 (Closing on the Today screen), 03 (Egg Count with Egg Rating on the Today screen). Ticket 04's navigation bar is nice to have; if 04 has not landed, create the bar here.

**Status:** ready-for-agent

- [ ] History tab in the bottom navigation lists Day Entries newest first; days with no entry are not listed
- [ ] Each row shows the date, Egg Count with Egg Rating, and Closing status
- [ ] Tapping a row opens the day detail with Closing and Egg Count cards for that date, reusing the Today cards
- [ ] Changes made in the day detail are saved to that day's Day Entry and reflected in the list
- [ ] A past day without an entry can be opened (e.g. via a date picker limited to today and earlier) and backfilled; its Flock snapshot is the current Flock
- [ ] Future dates cannot be selected
- [ ] Test: a past day in a different month is rated using that month's Laying Rate and its own Flock snapshot
