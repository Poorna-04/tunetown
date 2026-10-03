# TuneTown Wireframes

These low-fidelity wireframes define page content and responsive order. Visual styling will be refined during implementation without changing the required information hierarchy.

## Shared layout

### Mobile

```text
┌──────────────────────────────┐
│ Skip link                    │
│ Logo   Delivery PIN   Cart   │
│ Search                       │
│ Menu                         │
├──────────────────────────────┤
│ Page heading                 │
│ Main page content            │
├──────────────────────────────┤
│ Footer links                 │
└──────────────────────────────┘
```

### Desktop

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo  Search             Delivery PIN  Role  Wishlist  Cart │
│ Primary navigation                                         │
├─────────────────────────────────────────────────────────────┤
│ Main page content                                           │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

## Home and catalogue

Mobile order: hero carousel, controls, filters button, result summary, one-column grid, pagination, recently viewed.

Desktop order: hero carousel, filter sidebar beside a four-column grid, pagination, recently viewed.

## Product details

Mobile order: gallery, title and price, stock and delivery, quantity and actions, tabs, related products.

Desktop order: gallery beside purchase information, followed by full-width tabs and related products.

## Cart and wishlist

Mobile uses stacked item cards followed by the totals panel. Desktop uses item rows beside a sticky totals panel. Wishlist uses the shared responsive product grid.

## Checkout

All widths show the progress indicator above the active step. Mobile stacks forms. Desktop places delivery and billing forms side by side. Review includes Edit links for both earlier steps.

## Order confirmation

Order identity and status appear first, followed by the item table, totals, cancellation control, and print action.

## Account

Mobile uses a compact account navigation row above nested content. Desktop uses a side menu beside Orders, Addresses, or Preferences.

## Admin products

Mobile shows search and actions above a horizontally scrollable table only when necessary. Desktop shows search, bulk actions, sortable table, selection, and pagination in one view.

## Admin product form

Fields are grouped into basic details, pricing and stock, specifications, and images. Mobile stacks all fields; desktop uses a readable two-column form where labels remain close to their controls.

## Supporting states

Every data-driven page must also define loading, error with Retry, empty, and not-found states. Dialogs and toasts render through portals above the shared layout.
