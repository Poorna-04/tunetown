# TuneTown

TuneTown is a browser-only musical-instrument shop built with React 19, Redux Toolkit, and React Router. Product and user changes are managed by a local asynchronous data service backed by browser storage; the project has no server, database, or external API.

## Current status

The Core requirements for Modules 1–8 are implemented. Level-ups L2, L3 and L8 are implemented and documented in `docs/CHALLENGES.md`. The mentor-provided bug hunt remains pending.

## Requirements

- Node.js 22.13 or later
- npm 10 or later

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Use the Developer controls panel at the bottom-right to change service delay and failure rate, run a sample service call, inspect its log, or restore the original product data.

## Commands

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
npm run preview
```

Run `npm run generate:data` only when intentionally regenerating the committed product JSON and local SVG assets.

Implementation decisions and challenge evidence are in [`docs/ADR.md`](./docs/ADR.md) and [`docs/CHALLENGES.md`](./docs/CHALLENGES.md).

The catalogue source is generated deterministically with `npm run generate:data`. The generated `src/data/products.json` and local SVG image assets are committed so a fresh clone can run without generating data first.

All JSON and browser-storage access belongs to `src/services/`. UI code must use this Promise-based service so delays, failures, validation, persistence, call logging, and cross-tab notifications remain consistent.

## Verification

- `npm run lint`: passed
- `npm test`: 35 tests passed
- `npm run build`: passed
- Checkout leave confirmation and draft restoration: browser checked
