# 01: App skeleton and Flock setup

**What to build:** On first launch the keeper sees a setup screen (in Polish) asking for the number of Hens and Roosters. After saving, they land on the "Dziś" (Today) screen showing their Flock, and on later launches the setup screen is skipped. This ticket also lays the foundation every later ticket builds on: a Vite + React + TypeScript app, mobile-first layout, Vitest + React Testing Library with a render helper that mounts the whole `<App>` with an injected clock and in-memory storage, a web app manifest so the app can be added to the phone's home screen, and a dev server reachable from a phone on the local network.

See `.scratch/kury-prototype/spec.md` (stories 1–5, 35–38) and `GLOSSARY.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] App is scaffolded with Vite + React + TypeScript; tests run with Vitest + React Testing Library in jsdom
- [x] `<App>` accepts an injected clock (today's date) and storage adapter; defaults are the real date and localStorage
- [x] A test render helper mounts `<App>` with a fake clock and in-memory storage
- [x] First launch shows the Flock setup screen with inputs for hens and roosters
- [x] Zero roosters and multiple roosters are accepted; a Flock with zero hens and zero roosters is rejected with a visible message
- [x] After saving, the Today screen shows the configured Flock
- [x] Remounting `<App>` with the same storage skips setup and shows the Today screen (tested)
- [x] All UI text is in Polish; layout is usable on a ~375px-wide screen with one thumb
- [x] A web app manifest (name, icon, standalone display) makes the app installable to the home screen
- [x] The dev server is exposed on the local network so a phone on the same Wi-Fi can open it; how to do so is noted in the README
