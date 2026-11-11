Status: ready-for-agent

# Spec: Kury — mobile-first prototype

## Problem Statement

A backyard chicken keeper shuts the coop every evening and wants to be sure every bird made it inside. Today they count in their head and forget the numbers by the next day. They also collect eggs daily but have no way of telling whether a given day's Egg Count is normal for their Flock size and the time of year — a low count in November is expected, the same count in May may signal a problem. They want a quick tool on their phone to record both and get an immediate verdict.

## Solution

A mobile-first web app (installable to the phone's home screen) in Polish. On first launch the keeper configures their Flock: number of Hens and number of Roosters. Each day they open the "Dziś" (Today) screen, which has two large thumb-friendly cards:

- **Closing**: steppers for hens and roosters, prefilled with the full Flock, and a button to close the coop. After closing, the card shows either "all in" or the Shortfall (e.g. "brakuje 1 kury").
- **Egg Count**: a stepper for today's eggs, with the Expected Eggs for today and an Egg Rating (poor / normal / great) based on the Flock's hens and the month's Laying Rate.

A History screen lists past Day Entries with a 7-day and 30-day summary, and any past day can be opened to fill in or correct its Closing and Egg Count. A Settings screen lets the keeper change the Flock; past Day Entries keep the Flock as it was on their day. All data lives in the browser on that one device.

## User Stories

### First launch and Flock

1. As a keeper, I want to be asked for my number of hens and roosters on first launch, so that the app knows my Flock before I record anything.
2. As a keeper, I want to set zero roosters, so that a hens-only Flock is supported.
3. As a keeper, I want to set more than one rooster, so that a Flock with several roosters is supported.
4. As a keeper, I want the setup to reject a Flock with zero hens and zero roosters, so that I cannot configure an empty Flock.
5. As a keeper, I want to skip the setup screen on later launches, so that I go straight to today's screen.
6. As a keeper, I want to change my Flock in Settings, so that I can reflect birds bought, sold or lost.
7. As a keeper, I want a Flock change to apply from today onward, so that past Shortfalls and Egg Ratings stay as they were.
8. As a keeper with no roosters, I want the rooster stepper hidden on the Closing card, so that the screen only shows what applies to me.

### Closing

9. As a keeper, I want the Closing steppers prefilled with my full Flock, so that on a normal evening closing the coop is a single tap.
10. As a keeper, I want to lower or raise the hen and rooster counts with large +/− buttons, so that I can record what I actually counted with one thumb.
11. As a keeper, I want the counts to never go below zero, so that I cannot record nonsense.
12. As a keeper, I want to record more birds than the Flock if that is what I counted, so that the app does not block me; it simply shows no Shortfall.
13. As a keeper, I want a "close the coop" button that saves the Closing for today, so that the evening check is recorded.
14. As a keeper, I want to see "all in" after closing when the counts match the Flock, so that I get reassurance.
15. As a keeper, I want to see a clearly highlighted Shortfall (e.g. "brakuje 1 kury", "brakuje koguta") when fewer birds were counted, so that I notice missing birds immediately.
16. As a keeper, I want a Shortfall to leave my Flock unchanged, so that a hen that turns up tomorrow does not require reconfiguration.
17. As a keeper, I want to correct today's Closing after saving it, so that a miscount can be fixed.

### Egg Count

18. As a keeper, I want to enter today's Egg Count with large +/− buttons, so that recording eggs is quick on a phone.
19. As a keeper, I want to record eggs independently of the Closing, so that I can log eggs in the afternoon before closing the coop.
20. As a keeper, I want to update today's Egg Count several times during the day, so that I can add a later collection.
21. As a keeper, I want the Egg Count to never go below zero, so that I cannot record nonsense.
22. As a keeper, I want to see today's Expected Eggs, so that I know what is typical for my Flock this month.
23. As a keeper, I want an Egg Rating of poor, normal or great next to my Egg Count, so that I immediately know whether the day was good.
24. As a keeper, I want the Egg Rating based on the hens in my Flock (not those counted at Closing), so that a single missing hen does not distort the rating.
25. As a keeper, I want the Expected Eggs to follow the season, so that a low winter count is not flagged as poor.
26. As a keeper with no hens, I want no Egg Rating shown, so that I am not shown a meaningless verdict.

### History

27. As a keeper, I want a list of past Day Entries, newest first, so that I can review recent days.
28. As a keeper, I want each listed day to show the date, Egg Count with its Egg Rating, and Closing status (all in / Shortfall / not closed), so that I can scan the history at a glance.
29. As a keeper, I want a summary for the last 7 and last 30 days — total eggs, average eggs per day, number of days with a Shortfall — so that I see trends without a chart.
30. As a keeper, I want to open any past day, so that I can fill in an Egg Count or Closing I forgot.
31. As a keeper, I want to correct a past day's Closing and Egg Count, so that mistakes can be fixed.
32. As a keeper, I want a past day's Expected Eggs and Egg Rating to use that day's Flock and that day's month, so that history is evaluated fairly.
33. As a keeper, I want future dates to be unavailable, so that I cannot record days that have not happened.
34. As a keeper, I want days with no data simply absent from the list (or clearly marked as empty when opened), so that the history is not cluttered.

### General

35. As a keeper, I want my data to survive closing and reopening the app, so that I do not lose my records.
36. As a keeper, I want the whole interface in Polish, so that it is natural to use.
37. As a keeper, I want to add the app to my phone's home screen, so that I can open it like a native app.
38. As a keeper, I want the layout designed for a phone held in one hand, so that I can use it standing in front of the coop.
39. As a keeper, I want simple navigation between Today, History and Settings, so that I can always find my way back.

## Implementation Decisions

- **Stack**: Vite + React + TypeScript, single-page app, plain CSS (mobile-first). A web app manifest makes it installable to the home screen; no service worker, no offline support.
- **Users and data**: single keeper, single device, no accounts, no backend. Data is persisted in the browser's localStorage.
- **Two injected dependencies** at the App root, so the app can be driven from tests:
  - a **clock** providing today's date (defaults to the real date),
  - a **storage** adapter with load/save of the whole app state (defaults to localStorage; tests use an in-memory implementation).
- **State shape** (conceptual):
  - `flock`: `{ hens: number, roosters: number }` or absent before setup.
  - `dayEntries`: keyed by calendar date (local date, `YYYY-MM-DD`), each holding `flock` (snapshot at the time the entry was created), optional `closing: { hens, roosters }`, optional `eggCount: number`.
  - A Day Entry is created the first time either its Closing or Egg Count is saved; the Flock snapshot is taken at that moment from the current Flock. Changing the Flock in Settings does not rewrite existing entries.
- **Domain logic** lives in a small pure module (no React) used by the UI:
  - **Shortfall**: per bird type, `max(0, flock − counted)`. "All in" when both are zero.
  - **Laying Rate** by month (fixed, not configurable): Jan 0.30, Feb 0.40, Mar 0.65, Apr 0.80, May 0.80, Jun 0.75, Jul 0.70, Aug 0.65, Sep 0.55, Oct 0.40, Nov 0.25, Dec 0.25.
  - **Expected Eggs** = hens in the entry's Flock × Laying Rate for the entry's month. Displayed rounded to one decimal or whole number (UI choice).
  - **Egg Rating**: ratio = Egg Count / Expected Eggs. `< 0.6` → poor ("słabo"), `0.6–1.2` inclusive → normal ("norma"), `> 1.2` → great ("świetnie"). No rating when there are no hens.
- **Screens**: Setup (first launch only), Today, History (summary + list), Day detail (same two cards as Today, for a past date), Settings (edit Flock). Navigation via a bottom bar on Today / History / Settings.
- **Date handling**: "today" comes from the injected clock in local time; the Day detail screen refuses dates after today.
- **Running on the phone**: during development, the dev server is exposed on the local network so a phone on the same Wi-Fi can open it. Deployment to free static hosting (Netlify / Vercel / GitHub Pages) is the final step once the prototype works.

## Testing Decisions

- **One seam: the whole `<App>`**, rendered in jsdom with Vitest + React Testing Library, with an injected clock and in-memory storage. Tests interact like the keeper: find elements by role and visible Polish text, click steppers and buttons, read results off the screen.
- Good tests assert **external behaviour only**: what the keeper sees after doing something. They do not reach into component state, the storage format, or the domain module's internals.
- **Persistence** is tested by saving through the UI, unmounting, remounting `<App>` with the same storage instance, and asserting the data is shown again.
- **Seasonality and history** are tested by setting the injected clock to specific dates (e.g. a November day vs a May day; "yesterday" for backfilling).
- **Domain logic** (Shortfall, Expected Eggs, Egg Rating thresholds) is covered through the UI. Direct unit tests of the pure domain module are allowed only if threshold edge cases (exactly 60% / 120%) prove awkward to reach via the UI.
- **Prior art**: none; this is a greenfield repo. The first test establishes the render helper (App + fake clock + in-memory storage).

## Out of Scope

- Multiple users, accounts, login, syncing between devices, any backend.
- Tracking individual birds (names, ages, breeds).
- Breed- or age-adjusted Laying Rates; a configurable Laying Rate table; ratings based on the keeper's own historical average.
- Recording reasons for a Shortfall (lost / dead / sold) or auto-adjusting the Flock.
- Recording the time of Closing.
- Reminders and push notifications.
- Offline support / service worker beyond the installable manifest.
- Charts.
- Data export, import or backup.

## Further Notes

- Data lives only in this browser's localStorage: clearing browser data wipes it, and entries made against the local dev server will not appear in the hosted version (different origin). Acceptable for a prototype.
- Vocabulary follows `GLOSSARY.md` (Flock, Hen, Rooster, Day Entry, Closing, Shortfall, Egg Count, Laying Rate, Expected Eggs, Egg Rating).
- The Laying Rate table is a rough estimate for a mixed-age backyard flock in Poland without supplemental lighting; it is expected to be tuned after real use.
