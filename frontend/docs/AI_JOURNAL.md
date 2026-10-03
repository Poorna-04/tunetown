# TuneTown AI Journal

The brief specifically names Claude for assessed AI activities. Entries in this file identify the actual assistant used; Codex work must not be presented as Claude work. Claude-specific assessment entries remain pending until they are genuinely performed with Claude or a mentor approves a substitute.

## Entry 001 Initial planning and foundation

- **Date:** 2026-09-26
- **Assistant:** OpenAI Codex
- **Goal:** Convert the supplied capstone brief into a practical specification, architecture, milestone plan, and Milestone 1 implementation approach.
- **Prompt summary:** Review the TuneTown document, identify required documentation, recommend five milestones, and begin the React/Vite JavaScript implementation with simple, explainable code and local Git history.
- **Output summary:** Proposed a browser-only service boundary, clear state ownership, five milestones, stacked local branches, and Vite-based setup.
- **Kept:** Vite, JavaScript with PropTypes, Redux Toolkit, URL-owned filters, Context-owned delivery PIN, `useReducer` checkout, native browser APIs, and service-only persistence.
- **Changed:** Large uploaded images will use IndexedDB instead of data URLs in `localStorage` to avoid quota and performance problems.
- **Rejected:** Create React App because the supplied brief requires Vite and Create React App is not the appropriate scaffold for this project.
- **Verification:** Compared the plan with the eight modules, cross-cutting requirements, required documentation, and Phase 1 completion criteria in the supplied brief.

## Entry 002 React project setup

- **Date:** 2026-09-26
- **Assistant:** OpenAI Codex
- **Goal:** Configure the required React 19 and Vite JavaScript project with routing, Redux, linting, formatting, and tests.
- **Prompt summary:** Implement Milestone 1 with simple code, explanatory comments, local Git history, and no linked Git account.
- **Output summary:** Added the application shell, placeholder routes, Redux store, error boundary, responsive base styles, ESLint, Prettier, and Vitest.
- **Kept:** Current React, Vite, Redux Toolkit, React Router, and test-library packages.
- **Changed:** Downgraded jsdom from 30 to 29.1.1 after npm reported that jsdom 30 does not support the laptop's Node 22.16 patch version.
- **Rejected:** Ignoring the npm engine warning because it could make tests unreliable on this laptop.
- **Verification:** `npm run lint`, `npm test`, and `npm run build` completed successfully; npm reported zero vulnerabilities.

## Entry 003 Product dataset

- **Date:** 2026-09-26
- **Assistant:** OpenAI Codex
- **Goal:** Create the required 60-product dataset with local images and deliberate edge cases.
- **Prompt summary:** Continue Milestone 1 and keep the code simple, documented, and testable.
- **Output summary:** Added a deterministic data generator, 60 generated product records, 12 category placeholder images, one fallback image, and dataset tests.
- **Kept:** Ten products in each required category, fictional brands, local images, and explicit coverage for stock, discount, title-length, image, and decimal-price edge cases.
- **Changed:** Generated SVG assets alongside JSON instead of manually duplicating image files.
- **Rejected:** Remote placeholder-image URLs because the brief requires local images and the app must not depend on an external service.
- **Verification:** Dataset tests confirm 60 unique IDs, all six categories, required fields, two images per product, and every specified edge case.

## Entry 004 Local data service

- **Date:** 2026-09-26
- **Assistant:** OpenAI Codex
- **Goal:** Implement and test the complete browser-only asynchronous data service before feature UI depends on it.
- **Prompt summary:** Follow the supplied operations, simulated delay and failure behavior, status codes, persistence rules, and developer-control requirements.
- **Output summary:** Added a versioned storage adapter, service configuration store, call logging, cross-tab events, product queries, stock, orders, reviews, addresses, manager product changes, cart, wishlist, preferences, session, checkout drafts, recently viewed products, and reset.
- **Kept:** One public Promise wrapper for consistent delay, failure, logging, and `ServiceError` handling.
- **Changed:** Reset bypasses simulated failures so a developer can always recover from a 100% failure setting. Card fields are removed inside the service before a checkout draft is persisted.
- **Rejected:** Letting Redux components write `localStorage`, because it would bypass validation and violate the single-service rule.
- **Verification:** Service tests cover successful queries, safe malformed-storage fallback, `403`, `404`, `409`, simulated `500`, required reservation failure, idempotent ordering, stock deduction and restoration, one-review enforcement, address CRUD, manager-only writes, reset, and payment-data removal.

## Entry 005 Developer controls and shell verification

- **Date:** 2026-09-26
- **Assistant:** OpenAI Codex
- **Goal:** Complete the development-only service panel and verify the shared application shell.
- **Prompt summary:** Finish only Milestone 1, avoid module implementation, use simple explainable logic, and leave one staged change set for user review and commit.
- **Output summary:** Added runtime delay/failure controls, sample-call execution, reset, a live 50-entry service log, and responsive shell verification.
- **Kept:** `useSyncExternalStore` because the service configuration exists outside Redux and needs a small React subscription.
- **Changed:** Added an explicit Run test call action so service behavior can be verified without implementing a shopping module early.
- **Rejected:** Building catalogue UI during Foundation because Module 1 belongs to the next milestone.
- **Verification:** The browser displayed the mobile shell, nested Account route, not-found route, and a successful `getProducts` log showing 60 products. Lint, 18 tests, and production build passed.

## Entry 006 Shopping experience

- **Date:** 2026-09-27
- **Assistant:** OpenAI Codex
- **Goal:** Implement Milestone 2 as the Core requirements of Modules 1–4 without adding Level-ups or unrelated dependencies.
- **Prompt summary:** Build the complete home, catalogue, search, product details, cart, wishlist, and notification flow with the simplest explainable React logic and maintain the required documentation.
- **Output summary:** Added a responsive catalogue and carousel, URL-based search and filters, cached product details with reviews, service-backed cart and wishlist state, reusable tabs, quantity, dialog and toast components, and delivery-PIN context.
- **Kept:** Plain CSS, Redux Toolkit, React Router URL state, the existing browser-only service, and the 60-product dataset.
- **Changed:** Combined cart and wishlist into one small shopping slice because both store only product IDs and quantities at this stage. Persistence remains in a focused Redux middleware.
- **Rejected:** Tailwind and third-party carousel, form, toast, and persistence packages because native React, CSS, and browser APIs cover the Core behavior with less setup.
- **Verification:** ESLint, 21 automated tests, and a production build pass. The catalogue, product detail, cart, wishlist, URL filters, dialog, and error/retry states were checked in the browser.

## Entry 007 Checkout and order confirmation

- **Date:** 2026-09-27
- **Assistant:** OpenAI Codex
- **Goal:** Implement the Core requirements of Modules 5 and 6 without adding Level-ups or checkout dependencies.
- **Prompt summary:** Build Milestone 3 simply, keep it on a separate local branch, document decisions, and preserve the one-service architecture.
- **Output summary:** Added reducer-managed Address, Payment, and Review routes; saved-address management; accessible validation; offline handling; per-item stock checks; idempotent order placement; persistent confirmation; time-derived tracking; cancellation; and print styles.
- **Kept:** Controlled React fields, native forms, `useReducer`, React Router nested routes, and existing service operations.
- **Changed:** New order IDs now use the required `ORD-` plus six characters instead of the foundation service's temporary eight-character format.
- **Rejected:** A form library, payment library, and stored status timers because the native APIs and time calculations are smaller and easier to explain.
- **Verification:** ESLint, 28 automated tests, and the production build pass. A browser purchase covered validation focus, saved addresses, mock-card isolation, a failed order with safe retry, cart clearing, refreshable confirmation, invalid-ID redirect, and cancellation.

## Entry 008 Account and store manager

- **Date:** 2026-09-27
- **Assistant:** OpenAI Codex
- **Goal:** Implement the Core requirements of Modules 7 and 8 as Milestone 4 with simple browser-native code.
- **Prompt summary:** Resume the incomplete milestone, remove unnecessary work, keep the code explainable, update the required documents, and leave one staged local change set.
- **Output summary:** Added nested Account routes, shared address management, persistent themes, lazy route groups, role-protected manager pages, product search/sort/pagination/selection, delayed delete with Undo, and React 19 add/edit actions with local image storage.
- **Kept:** Context for small global preferences, native forms and browser dialogs, the existing data-service boundary, and plain CSS.
- **Changed:** Product images use IndexedDB with short marker IDs in product data. Catalogue pages subscribe to service events so edits refresh in the current tab and other open tabs.
- **Rejected:** Base64 image data in `localStorage`, a form library, and immediate deletion followed by recreation because these add storage risk or unnecessary complexity.
- **Verification:** ESLint, 33 automated tests, and the production build pass. Separate Account, Checkout, and Admin chunks were produced. Browser checks covered the role guard, nested Account pages, persisted dark theme, admin validation, Undo, product-to-product form reset, and a live edit in a second shopper tab.

## Entry 009 Selected Level-ups

- **Date:** 2026-09-28
- **Assistant:** OpenAI Codex
- **Goal:** Complete three small Level-ups from different modules without adding dependencies.
- **Output summary:** Proved latest-only search results for L2, strengthened product-page cleanup for L3, and added safe checkout leave confirmation and draft restoration for L8.
- **Kept:** Existing Redux request IDs, keyed detail content, effect cleanup, checkout reducer, and local data service.
- **Changed:** Checkout waits for its draft before accepting input, and card fields are sanitized before service logging as well as storage.
- **Rejected:** A cancellation library and form-persistence package because the existing React and service patterns solve these cases with less code.
- **Verification:** ESLint, 35 automated tests, and the production build pass. A browser test confirmed the leave prompt and restored address input.
