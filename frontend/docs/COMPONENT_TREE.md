# TuneTown Component Tree

```text
AppProviders
├── Redux Provider
├── ThemeProvider
├── SessionProvider
├── DeliveryLocationProvider
└── RouterProvider
    └── RootErrorBoundary
        └── AppShell
            ├── SkipLink
            ├── Header
            │   ├── BrandLink
            │   ├── GlobalSearch
            │   ├── DeliveryPinControl
            │   ├── RoleSwitch
            │   ├── WishlistLink
            │   └── CartLink
            ├── PrimaryNavigation
            ├── Main Outlet
            │   ├── HomePage
            │   ├── ProductDetailPage
            │   ├── CartPage
            │   ├── WishlistPage
            │   ├── CheckoutLayout
            │   │   ├── CheckoutProgress
            │   │   ├── CheckoutAddressPage
            │   │   ├── CheckoutPaymentPage
            │   │   └── CheckoutReviewPage
            │   ├── OrderConfirmationPage
            │   ├── AccountLayout
            │   │   ├── AccountOrdersPage
            │   │   ├── AccountAddressesPage
            │   │   └── AccountPreferencesPage
            │   ├── AdminLayout
            │   │   ├── AdminProductsPage
            │   │   │   └── UndoToast
            │   │   └── AdminProductFormPage
            │   └── NotFoundPage
            ├── Footer
            ├── ToastViewport
            └── DialogPortal
```

Milestone 2 implements `ProductCard`, `ProductImage`, `QuantityInput`, compound `Tabs`, `Dialog`, `ToastViewport`, `LoadingGrid`, and `ErrorState`. Milestone 3 adds `AddressFields`, `CheckoutProgress`, and `OrderItemsTable`. Milestone 4 reuses `AddressFields` in Account and adds the nested Account and Store Manager pages.
