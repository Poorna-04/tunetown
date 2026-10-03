# TuneTown Product Specification

## 1. Purpose

TuneTown is a browser-based Indian online store for musical instruments, accessories, and studio equipment. It must demonstrate a complete shopping journey and a store-manager workflow without a backend, database, or external API.

The project is an individual React capstone. Every retained line of code must be understandable and explainable during the final demonstration.

## 2. Product goals

TuneTown must allow a shopper to:

- Browse, search, filter, sort, and view products.
- Maintain a cart and wishlist across refreshes.
- Review products and manage delivery addresses.
- Complete checkout with reliable stock and order handling.
- View, track, cancel, and print an order.
- Manage delivery location, addresses, order history, and theme preferences.

TuneTown must allow a store manager to:

- Search, sort, select, add, edit, and delete products.
- Preview and save locally selected product images.
- See catalogue changes appear in the shopper experience, including other open tabs.

## 3. Users and roles

### Shopper

The default role. A shopper can use the catalogue, product pages, cart, wishlist, checkout, orders, addresses, and preferences.

### Store manager

A role selected from the header. There is no real authentication. A shopper who opens an admin URL sees a sign-in prompt and returns to the originally requested page after switching to the store-manager role.

## 4. Scope and constraints

- Use Vite, React 19, Redux Toolkit, React-Redux, and React Router 6.4 or later.
- Use JavaScript initially. TypeScript remains an optional stretch goal.
- Use plain CSS or CSS Modules. Do not use a UI component library.
- Use Vitest with React Testing Library for automated tests.
- Keep all data in a local JSON file and browser storage.
- Do not use a server, database, or external API.
- Components must not read the product JSON or browser storage directly. All reads and writes must go through the local data service.
- Every page must have its own URL.
- All user and manager changes must survive refresh where the requirements call for persistence.
- Development-only controls must be excluded from the production build.

## 5. Product catalogue

Create `src/data/products.json` with at least 60 products across these categories:

- Guitars
- Keyboards
- Percussion
- Indian classical
- Studio audio
- Accessories

Each product must contain:

- `id`
- `title`
- `description`
- `category`
- `brand`
- `price`
- `discountPercentage` when applicable
- `rating`
- `stock`
- `specs` as key-value pairs
- `thumbnail`
- `images`

The dataset must include realistic edge cases: out-of-stock products, zero discounts, missing discount fields, long titles, missing or broken images, and prices with paise. Images must be local assets or generated placeholders, never remote URLs.

## 6. Local data service

The data service lives under `src/services/`, returns Promises, and is the only layer that accesses initial JSON data or browser storage.

It must provide the following required operations:

- `getProducts({ q, category, skip, limit })`
- `getProduct(id)`
- `getCategories()`
- `getStock(id)`
- `reserveStock(id, qty)`
- `placeOrder(order)`
- `getOrders()` and `cancelOrder(id)`
- `getReviews(productId)` and `addReview(productId, review)`
- Address create, read, update, and delete operations
- Product create, update, and delete operations

Additional service functions may be added for cart, wishlist, preferences, and reset behavior so UI components never access browser storage directly.

`getProducts` must search the title, brand, and description and return `{ products, total }`. It may accept additional optional brand, rating, price, and sort parameters so filtering, sorting, counting, and pagination remain consistent in one place.

Service behavior:

- Every call has a configurable random delay.
- Failures reject with an error carrying status `404`, `409`, or `500` as appropriate.
- Unknown records return `404`.
- `reserveStock` takes approximately 300 ms and fails 30% of the time when that scenario is enabled.
- `placeOrder` takes approximately two seconds, fails roughly one time in three when enabled, returns `409` for insufficient stock, and reduces stock only on success.
- Orders are returned newest first.
- Orders may be cancelled only during the first 60 seconds.
- A shopper may review a product only once.
- Product changes appear in the shop immediately.

Development defaults and production defaults come from environment variables. Development uses a 300-1,200 ms delay and 0% global failure rate; production uses a 300-800 ms delay and 0% global failure rate. Development settings can be changed at runtime.

## 7. Functional requirements

### 7.1 Home and catalogue

- Show a three-offer hero carousel that advances every five seconds.
- Pause the carousel while it is hovered or contains keyboard focus.
- Provide keyboard-accessible previous, next, and dot controls.
- Display a responsive product grid: one column on mobile, two on tablet, and four on desktop.
- Show image, meaningful alternative text, title, brand, price, rating, and Add to cart on each product card.
- For discounted products, show the discount and struck-through original price. Show neither when no discount applies.
- Disable adding out-of-stock products. Show `Only N left` when stock is below five.
- Use pagination with 12 products per page and show `Showing X of Y products`.
- Load products and categories together and reveal the grid only after both are ready.
- Keep the loading indicator visible for at least 1.5 seconds to prevent flicker.
- Show a friendly error and Retry action when loading fails.
- Show the five most recently viewed products, newest first, without duplicates, across refreshes.

### 7.2 Search, filters, and sorting

- Update results while the shopper types without calling the service on every keystroke.
- Pressing `/` focuses search unless the user is already typing in a form field.
- Filter by category, multiple brands, minimum rating, and minimum/maximum price.
- Show product counts beside category options.
- Sort by relevance, price in both directions, rating, and newest.
- Returning to relevance must restore the service's original order.
- Show a live result count, removable filter chips, and Clear all.
- Store search, filters, sorting, and pagination in the URL so refresh, sharing, Back, and Forward work correctly.
- Show a helpful empty state when nothing matches.

### 7.3 Product details and reviews

- Use `/products/:id` and show a not-found page for an invalid or missing ID.
- Reuse an already loaded product immediately instead of requesting it again.
- Provide an image gallery with thumbnails and left/right arrow navigation.
- Provide reusable, keyboard-compliant compound Tabs for Description, Specifications, and Reviews.
- Provide a reusable quantity input with typing, plus, minus, and `+5` controls.
- Limit quantity to the available stock. If the requested quantity is too large, focus the input and select its text.
- Refresh stock every 30 seconds while the page is mounted.
- Show a delivery estimate of three working days when a delivery PIN exists; otherwise prompt for a PIN.
- Show review average, count per star, and reviews newest first.
- Allow one review per shopper per product with keyboard-accessible rating, title, and text.
- Render review text exactly as entered but always as text, never executable HTML.
- Update reviews and their average without reloading.
- Show related products from the same category using the shared product-card component.

### 7.4 Cart, wishlist, dialogs, and notifications

- Add, remove, increase, and decrease cart quantities without mutating product objects.
- Adding an existing item increases its quantity within available stock.
- Confirm removal with a reusable modal dialog rendered above the sticky header.
- Close the dialog with Escape, Cancel, or an outside click, and restore focus to its trigger.
- Hide the header cart badge when empty; otherwise show the total item quantity.
- Show subtotal, 18% GST, shipping, grand total, and total savings in Indian rupee format with two decimals.
- Shipping is free above ₹999 and ₹49 otherwise.
- Persist cart and wishlist across refreshes.
- Display an empty-cart action that returns to shopping.
- Show portal-based toast notifications that stack, disappear after three seconds, pause on hover, and are not clipped.
- Update wishlist hearts optimistically. Roll back and show an error toast if persistence fails.
- Provide Move to cart and Remove actions on the Wishlist page.

### 7.5 Checkout

- Provide Address, Payment, and Review steps with a progress indicator.
- Manage the step flow with `useReducer`.
- Preserve entered values while moving between steps.
- Provide Edit links from Review to Address and Payment.
- Select, add, edit, and delete saved addresses.
- On wide screens, show billing and delivery forms side by side with unique, correctly linked labels.
- Collect name, email, phone, address, city, and PIN code.
- Support Cash on Delivery and a mock card with number, expiry, and CVV.
- Never persist card details.
- Validate on blur and submit: required fields, email, 10-digit phone, 6-digit PIN, 16-digit card number, and future expiry.
- Focus the first invalid field and announce errors to screen-reader users.
- Pressing Enter in a field submits the current step.
- Show an offline banner and disable Place order while offline.
- Before ordering, request the latest stock once for each cart item and identify shortages.
- Prevent duplicate orders from repeated clicks or Enter presses.
- Allow retry after an order failure without losing valid form information.
- Navigate to confirmation only after a successful order.

### 7.6 Order confirmation and tracking

- Generate a unique order ID in the format `ORD-` followed by six characters.
- Show one summary row per item and a savings row directly after each discounted item.
- Clear the cart after a successful order.
- Preserve the confirmation across refreshes. Redirect to home when no valid order is available.
- Derive status from the placement time: Placed, Packed, Shipped, and Delivered, advancing every 20 seconds.
- Show a live cancellation countdown during the first 60 seconds.
- Provide a clean print view without navigation, footer, or action buttons.

### 7.7 Account and preferences

- Manage the delivery PIN through React Context and make it available to the header, product page, cart, and checkout without prop drilling.
- Provide a shared Account layout with nested Orders, Addresses, and Preferences routes.
- Highlight the active account menu item.
- Reuse the same addresses in Account and Checkout.
- Support Light, Dark, and System themes.
- Apply the stored theme before the first visible render and follow operating-system changes live in System mode.
- Lazy-load Account, Checkout, and Admin code with visible loading fallbacks.

### 7.8 Store-manager admin

- Protect admin routes using the current role and preserve the originally requested URL.
- Show a products table with search, sortable columns, pagination, and row selection.
- Support bulk delete with a five-second Undo period. Do not delete permanently until Undo expires.
- Use React 19 form actions for product creation and editing.
- Include every product field with field-level validation.
- Show `Saving…` and disable Save during submission.
- Preview locally selected image files before saving.
- Release replaced preview object URLs to avoid memory leaks.
- Reset the edit form completely when changing from one product to another.
- Warn before leaving with unsaved changes.
- Propagate catalogue changes to the shopper view and other tabs immediately.

## 8. Developer controls

In development only, provide a panel that:

- Changes the delay range and global failure rate for the next service call.
- Displays a live service-call log containing function, arguments, duration, and result.
- Resets all stored application data to the original product JSON.

## 9. Cross-cutting quality requirements

### Accessibility and responsive design

- Use semantic header, navigation, main, and footer landmarks.
- Provide one `h1` per page and a Skip to content link.
- Support keyboard-only use with visible focus states.
- Follow established keyboard patterns for dialogs, tabs, carousel controls, galleries, rating controls, and forms.
- Maintain at least 4.5:1 text contrast in light and dark themes.
- Work without horizontal scrolling from 360 px phones to wide desktops.
- Reach Lighthouse Accessibility 90 or higher on Home, Product details, Checkout, and Admin products.

### React and reliability

- Use functional components except for the required class-based error boundary.
- Run under StrictMode without console warnings during a complete purchase.
- Show localized friendly fallbacks when a UI section crashes.
- Provide loading, error, and empty states for every data-driven view.
- Create at least three custom hooks that remove real duplication.
- Create one Redux middleware that solves a real application need.
- Keep totals, counts, and filtered values derived rather than duplicated.
- Record exactly one `page_view` event for each route visit.
- Use PropTypes unless the project is migrated to TypeScript.
- Keep React Hooks ESLint rules enabled.

### Performance and compatibility

- Reach Lighthouse Performance 85 or higher on the production Home page.
- Record the production bundle size in `README.md`.
- Prevent components from re-rendering when their visible data has not changed and demonstrate one example with React DevTools Profiler.
- Verify Chrome, Firefox, and Edge or Safari and document differences.

## 10. Recommended Level-ups

Complete at least three Level-ups from three different modules. The simplest useful initial selection is:

1. **L2 Unreliable search:** debounce input and ignore or cancel stale responses so results always match the current URL query.
2. **L3 Fast product browsing:** cancel requests and stock timers when the product ID changes or the page unmounts.
3. **L8 Half-filled checkout:** warn before leaving and restore non-card checkout fields when the shopper returns.

Each Level-up must be documented in `docs/CHALLENGES.md` with the problem, reproduction, fix, and a test proving the behavior.

## 11. Testing requirements

At minimum, automated tests must cover:

- Data-service success, `404`, `409`, and random `500` failures.
- Cart and checkout reducers.
- At least two custom hooks.
- Checkout validation.
- Tabs keyboard behavior.
- One complete purchase integration flow.
- Timer behavior using fake timers rather than real waiting.

Record at least 20 verified edge cases in `docs/EDGE_CASES.md`. Complete a production self-test against every Core requirement and chosen Level-up. Two peers must also test the app, and all blocker and major issues must be fixed and verified or explained.

## 12. Documentation and evidence

Maintain the following files required by the brief:

- `README.md`
- `docs/ADR.md`
- `docs/AI_JOURNAL.md`
- `docs/CHALLENGES.md`
- `docs/EDGE_CASES.md`
- `docs/CODE_REVIEW.md`
- `docs/SECURITY.md`
- `docs/TEST_PLAN.md`
- `docs/PEER_TESTS.md`

Also keep the wireframes, component tree, and state map under `docs/`. The README must include setup, features, screenshots, component tree, Lighthouse results, browser notes, concept explanations, bundle size, and AI reflection.

AI-assisted work must be reviewed and understood. Record prompts, results, accepted or rejected suggestions, verification, at least two debugging cases, one refactor, and at least three incorrect or risky AI suggestions that were caught.

## 13. Definition of done

TuneTown is complete when:

- Every Core requirement works in the production build.
- At least three Level-ups from different modules are complete and proven.
- Tests and lint pass without warnings.
- Accessibility, performance, keyboard, responsive, and browser targets are met.
- Security and documentation requirements are complete.
- Two peers have tested the app and verified fixes for blocker and major issues.
- The repository contains meaningful commits and the required step-based review history.
- A 15-minute demo can show a purchase, admin edit, test, architecture decision, Level-up, peer-found issue, and caught AI mistake.

## 14. Out of scope until Core completion

Do not prioritize comparison, coupons, localization, image zoom, sales dashboards, offline installation, CI, or TypeScript migration until all Core requirements and required quality work are complete.
