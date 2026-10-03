# TuneTown Architecture

## 1. Architecture goals

The architecture should make TuneTown reliable under delays, failures, refreshes, rapid navigation, and multiple open tabs while remaining simple enough to explain during a live review.

The central rule is:

```text
React pages and components
        ↓
Redux actions, hooks, and route state
        ↓
Local asynchronous data service
        ↓
products.json and browser storage
```

Only the data service may read the initial JSON or browser storage. Components receive data through Redux, Context, hooks, or service-backed page logic.

## 2. Recommended technology choices

| Concern           | Choice                                                                               | Reason                                                                         |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Language          | JavaScript with PropTypes                                                            | Meets the brief and keeps the first release manageable                         |
| Build             | Vite                                                                                 | Required, fast, and simple                                                     |
| UI                | React 19                                                                             | Required                                                                       |
| Routing           | React Router data-capable APIs                                                       | Supports nested, protected, parameterized, and lazy routes                     |
| Shared state      | Redux Toolkit                                                                        | Required and suitable for cart, wishlist, catalogue cache, and toast data      |
| URL state         | `useSearchParams`                                                                    | Makes search and filters shareable and browser-navigation friendly             |
| Local flow state  | `useReducer`                                                                         | Required for checkout and clear for multi-step transitions                     |
| Location state    | React Context                                                                        | Required for the delivery PIN                                                  |
| Styling           | Plain CSS organized by component blocks                                              | Keeps the required responsive rules visible and adds no styling dependency     |
| Tests             | Vitest and React Testing Library                                                     | Integrates naturally with Vite                                                 |
| Persistence       | `localStorage` for structured data and IndexedDB for images, both behind the service | Keeps common data simple and avoids putting large image data in `localStorage` |
| Cross-tab updates | `BroadcastChannel` plus same-tab service events                                      | Small native solution that refreshes data without adding a package             |

Avoid adding a form library, carousel library, date library, state-persistence package, or component library unless a demonstrated problem justifies it. React, Redux Toolkit, React Router, `Intl`, and browser APIs cover the required behavior.

## 3. Suggested project structure

```text
src/
├── app/
│   ├── store.js
│   ├── router.jsx
│   └── AppProviders.jsx
├── assets/
│   ├── products/
│   └── placeholders/
├── components/
│   ├── common/
│   ├── feedback/
│   ├── forms/
│   ├── layout/
│   └── product/
├── context/
│   └── DeliveryLocationContext.jsx
├── data/
│   └── products.json
├── features/
│   ├── account/
│   ├── admin/
│   ├── cart/
│   ├── catalogue/
│   ├── checkout/
│   ├── orders/
│   ├── reviews/
│   └── wishlist/
├── hooks/
├── pages/
├── services/
│   ├── dataService.js
│   ├── storageAdapter.js
│   ├── imageStore.js
│   ├── serviceConfig.js
│   └── serviceEvents.js
├── styles/
├── test/
├── utils/
├── main.jsx
└── index.css
```

Keep code close to the feature that owns it. Move an item into `components/`, `hooks/`, or `utils/` only after it is genuinely shared.

## 4. Route design

```text
/
/products/:id
/cart
/wishlist
/checkout/address
/checkout/payment
/checkout/review
/orders/:orderId
/account/orders
/account/addresses
/account/preferences
/admin
/admin/products
/admin/products/new
/admin/products/:id/edit
/*
```

### Route organization

- `AppShell` owns the header, main landmark, footer, global toast portal, and dialog portal.
- Product, cart, and wishlist routes are part of the main shopper bundle.
- Checkout is lazy-loaded on first use.
- Account uses one lazy-loaded parent layout with nested pages.
- Admin uses a lazy-loaded protected layout and nested product routes.
- `ProductRoute` validates `:id` and renders the product-not-found view.
- `AdminLayout` keeps the requested URL open while showing its role prompt, then reveals that same page after the role changes.
- The catch-all route renders a general not-found page.

## 5. State ownership

State should live in the narrowest place that still serves every consumer.

| State                                       | Owner                                   | Persistence   | Notes                                                            |
| ------------------------------------------- | --------------------------------------- | ------------- | ---------------------------------------------------------------- |
| Product entities already loaded             | Redux catalogue slice                   | Data service  | Enables instant product details from cache                       |
| Current product list IDs and request status | Redux catalogue slice                   | No            | Represents the latest service result                             |
| Search, filters, sort, page                 | URL search parameters                   | URL           | Supports sharing, refresh, Back, and Forward                     |
| Cart items                                  | Redux shopping slice                    | Data service  | Store product ID and quantity; product data stays normalized     |
| Wishlist IDs                                | Redux shopping slice                    | Data service  | Optimistic updates with rollback                                 |
| Current role                                | React Context                           | Data service  | Used by the admin layout and header                              |
| Current order and order history             | Data service with page-local read state | Data service  | Confirmation survives refresh without duplicating orders         |
| Delivery PIN                                | React Context                           | Data service  | Explicit requirement; avoids unrelated global Redux state        |
| Checkout fields and step                    | `useReducer`                            | None for Core | Card number, expiry, and CVV remain in memory only               |
| Theme preference                            | React Context and document attribute    | Data service  | A bootstrap script avoids flash; System listens to media changes |
| Dialog open state                           | Nearest page/component                  | No            | Dialog shell remains reusable                                    |
| Toast queue                                 | Redux UI slice or focused Context       | No            | Redux middleware can create service-error toasts                 |
| Gallery selection and tabs                  | Component state                         | No            | Local, temporary UI state                                        |
| Admin form values                           | Native form/FormData                    | No            | React 19 form action reads values on submit                      |

### Why these choices

- URL state is the source of truth for shareable catalogue controls.
- Redux holds data used by unrelated pages or updated from many locations.
- Context is appropriate for the small delivery-location concern explicitly shared through the tree.
- Component state remains appropriate for temporary interaction details.
- Derived totals, counts, filtered IDs, and review summaries are selectors or calculations, never separately synchronized state.

## 6. Redux design

Recommended slices:

- `catalogueSlice`: normalized product cache, current result IDs, categories, loading, and error state.
- `shoppingSlice`: cart `{ productId, quantity }` entries and wishlist IDs. The persistence middleware saves both and rolls back a failed wishlist update.
- `ordersSlice`: current confirmation ID and cached orders.
- `sessionSlice`: shopper/store-manager role.
- `uiSlice`: global toast queue and developer-panel visibility.

Use `createEntityAdapter` for products because it provides a normalized cache and simple selectors. Use `createAsyncThunk` for service calls. This is easier to test and explain than adding RTK Query for a browser-only simulated service.

Add one focused custom middleware for persistence and cross-tab publication. It should react only to successful cart, wishlist, role, and catalogue mutations, call the data service, and publish a change event. Keep business rules inside reducers, thunks, or the service rather than the middleware.

## 7. Data-service design

### Responsibilities

The service must:

1. Load `products.json` once as the original dataset.
2. Read the latest saved application snapshot through `storageAdapter`.
3. Validate stored data before using it.
4. Apply delay and configured failure behavior to every public operation.
5. Enforce stock, review, address, order-cancellation, and manager-write rules.
6. Persist successful writes atomically.
7. log development calls with arguments, duration, result, and error.
8. Notify the application and other tabs about successful writes.

Filtering, sorting, counting, and pagination should happen in the service. Extend `getProducts` with optional brand, rating, price, and sort parameters while retaining the required parameters. Keeping this logic together prevents the UI from filtering only the currently loaded page and producing incorrect totals.

### Layers

```text
Public service operation
  → delay/failure wrapper
  → validation and business rule
  → in-memory snapshot
  → storage adapter
  → local event and cross-tab event
```

Use a small `ServiceError` class with a numeric `status` and safe message. UI code should branch on status only when recovery differs, such as `404` not found or `409` stock conflict.

### Storage keys

Use versioned keys so future schema changes do not destroy existing data:

```text
tunetown:v1:products
tunetown:v1:orders
tunetown:v1:reviews
tunetown:v1:addresses
tunetown:v1:cart
tunetown:v1:wishlist
tunetown:v1:preferences
tunetown:v1:session
tunetown:v1:checkout-draft
```

Store a `schemaVersion` with structured records. If parsing or validation fails, ignore the damaged record, restore a safe default, and log the recovery in development.

Store manager-selected image blobs in an IndexedDB `product-images` object store and save only their stable IDs with product records. `imageStore` creates and revokes temporary object URLs at the UI boundary. This avoids base64 expansion, `localStorage` quota problems, and slowdown after repeated image selections.

### Ordering and stock

`placeOrder` is the final authority for stock. It must:

1. Reject duplicate submission tokens.
2. Re-read the latest stored products.
3. Validate every requested quantity.
4. Return `409` without changing anything if any item is short.
5. Save the order and all stock deductions together in one updated snapshot.
6. Return the order ID and placement time.

JavaScript in one browser tab runs this section synchronously between storage reads and writes. Cross-tab events then refresh other tabs. For the capstone simulation, define a deterministic last-write/conflict rule in `ADR.md` and revalidate at `placeOrder` to prevent overselling in normal use.

## 8. Search and request coordination

Use this flow:

1. The search input updates a temporary input value immediately.
2. A reusable debounce hook waits briefly before updating the URL.
3. URL changes trigger `getProducts`.
4. Each request receives an `AbortController` or request ID.
5. A response is committed only if it still matches the latest request.

This satisfies smooth typing and prevents slower old responses from replacing current results. Category, brand, rating, price, sort, and page changes can update the URL immediately without the typing debounce.

## 9. Component design

### Shared components

- `ProductCard`: receives a product and action configuration so the same presentation works in catalogue, related, and recently viewed sections.
- `QuantityInput`: uses `forwardRef` and `useImperativeHandle` to expose focus-and-select behavior.
- `Tabs`: compound `Tabs.List`, `Tabs.Tab`, and `Tabs.Panel` components implementing the standard keyboard pattern.
- `Dialog`: reusable portal shell with focus trap, Escape, outside-click handling, and focus restoration.
- `ToastViewport`: portal-based stack with individual pauseable timers.
- `AddressForm`: accepts an ID prefix or uses `useId` so delivery and billing labels remain unique.
- `AsyncState`: consistent loading, error, retry, and empty presentation.
- `ProductImage`: meaningful alt text plus a local fallback for broken images.

### Error boundaries

Use a top-level error boundary around the routed content and smaller boundaries around complex areas where the rest of the page can remain useful. The error boundary is the permitted class component; the rest of the application remains functional components.

## 10. Forms

### Checkout

Use controlled fields managed by one `useReducer`. Actions should cover field changes, blur, validation, step navigation, saved-address selection, submission start, failure, and completion.

Keep validation in pure functions under the checkout feature so it can be tested directly. Store only non-payment draft fields through the service. Use refs to focus the first invalid field and an `aria-live` summary for announced errors.

### Admin product form

Use a React 19 form action with `FormData`, `useActionState`, and `useFormStatus`. Use a route key based on product ID to reset the form cleanly when switching products. Keep the selected image preview in component state and revoke the previous object URL whenever it changes or the component unmounts.

This deliberate difference supports the required comparison: checkout benefits from controlled state across steps, while the single-submit admin form is simpler when read at submission time.

## 11. Cart and wishlist consistency

- Reducers update the UI immediately.
- Persistence happens through the custom middleware and data service.
- Wishlist failures dispatch a compensating action that restores the previous state and creates a toast.
- Cart reservation stores an operation ID for each requested change. Only the matching latest operation may commit or roll back that item.
- Selectors calculate item count, subtotal, GST, shipping, savings, and total.
- Product objects are never changed when cart quantities change.

For other tabs, the service publishes the new version and changed domain. Receiving tabs reload that domain through the service and replace their Redux data only when the incoming version is newer.

## 12. Time-based behavior

Put date and time calculations in pure utilities:

- Add three working days for delivery estimates.
- Derive order status from `Date.now() - placedAt`; do not persist a moving status.
- Derive the cancellation time remaining from `placedAt`; do not trust a counter alone.
- Format money with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

Components may use intervals to refresh the display, but the displayed value must always be recalculated from timestamps. This keeps refreshes and background tabs correct.

## 13. Theme and browser state

- Place a minimal theme bootstrap script before React mounts so the saved theme is applied before the page is painted.
- Use `useLayoutEffect` to keep the document theme attribute synchronized after React starts.
- Use `useSyncExternalStore` to subscribe to operating-system theme changes through `matchMedia`.
- Use another `useSyncExternalStore` wrapper for online/offline browser events.
- Use native `beforeprint`/print CSS rather than generating a separate invoice document.

## 14. Accessibility approach

- Start with semantic elements before adding ARIA.
- Keep page headings and landmark labels unique.
- Implement the documented WAI-ARIA keyboard interaction for tabs and modal dialogs.
- Move focus deliberately after errors, route changes, dialog closure, and invalid quantities.
- Announce async errors, form summaries, and important cart changes with suitable live regions.
- Never render review text with `dangerouslySetInnerHTML`; React's normal text rendering preserves the content while preventing execution.
- Test core journeys using only a keyboard before running Lighthouse.

## 15. Performance approach

- Paginate the normal catalogue at 12 products.
- Lazy-load Checkout, Account, and Admin route groups.
- Memoize selectors rather than copying derived data into state.
- Use `React.memo` only after Profiler evidence identifies avoidable renders.
- Keep callbacks stable when passing them to memoized list items.
- Reserve `useDeferredValue` and `useTransition` for the optional 1,000-product Level-up.
- Validate selected image type and size, store the blob in IndexedDB, and revoke every temporary preview URL when replaced or unmounted.

## 16. Testing architecture

### Unit tests

- Data-service rules, errors, delay/failure injection, storage validation, and reset.
- Redux reducers and selectors.
- Checkout validation and date/currency utilities.
- Debounce, persistence, online-status, and other shared hooks.

### Component tests

- Tabs keyboard behavior.
- Dialog focus and dismissal.
- Quantity-input limits and imperative focus.
- Checkout error focus and announcements.
- Product cards for discount and stock variants.

### Integration tests

- Catalogue load and retry.
- Search race where an older response finishes last.
- Cart persistence and totals.
- Full purchase from cart through confirmation.
- `409` stock conflict and retry.
- Admin edit appearing in the catalogue.

Use fake timers for the minimum loader, carousel, stock refresh, toast expiry, order status, cancellation, delay simulation, and bulk-delete Undo.

## 17. Simple implementation sequence

1. Finalize wireframes, route map, component tree, state map, and initial decisions.
2. Set up Vite, linting, formatting, tests, router, and Redux store.
3. Create and validate the 60-product dataset.
4. Build and fully test the data service before UI modules depend on it.
5. Add development controls and reset behavior.
6. Build the app shell, global feedback components, themes, and route fallbacks.
7. Implement catalogue, search, and product details.
8. Implement cart, wishlist, and cross-tab persistence.
9. Implement checkout, orders, and account.
10. Implement admin and immediate catalogue synchronization.
11. Complete the three selected Level-ups.
12. Finish required tests, accessibility, performance, security, peer testing, and documentation.

Do not build stretch features until all Core requirements pass.

## 18. Decisions to record in `docs/ADR.md`

At minimum, record:

- JavaScript now versus TypeScript now.
- Redux, URL, Context, and component-state ownership.
- Service-side versus component-side filtering and sorting.
- Normalized product cache and detail-page reuse.
- Native storage middleware versus a persistence package.
- Controlled checkout versus admin form actions.
- Cross-tab conflict and version rules.
- Optimistic wishlist rollback.
- Search request cancellation or stale-response rejection.
- Theme bootstrap and no-flash strategy.

Each entry should state the chosen option, a real alternative, and why the choice is better for TuneTown.
