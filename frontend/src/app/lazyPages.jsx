import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

// These sections are downloaded only when the shopper first opens them.
export const CheckoutLayoutPage = lazy(() => import('../components/checkout/CheckoutLayout'));
export const CheckoutAddressRoute = lazy(() => import('../pages/CheckoutAddressPage'));
export const CheckoutPaymentRoute = lazy(() => import('../pages/CheckoutPaymentPage'));
export const CheckoutReviewRoute = lazy(() => import('../pages/CheckoutReviewPage'));
export const OrderConfirmationRoute = lazy(() => import('../pages/OrderConfirmationPage'));
export const AccountLayoutPage = lazy(() => import('../components/account/AccountLayout'));
export const AccountOrdersRoute = lazy(() => import('../pages/AccountOrdersPage'));
export const AccountAddressesRoute = lazy(() => import('../pages/AccountAddressesPage'));
export const AccountPreferencesRoute = lazy(() => import('../pages/AccountPreferencesPage'));
export const AdminLayoutPage = lazy(() => import('../components/admin/AdminLayout'));
export const AdminProductsRoute = lazy(() => import('../pages/AdminProductsPage'));
export const AdminProductFormRoute = lazy(() => import('../pages/AdminProductFormPage'));

export function LazyPage({ component: Component }) {
  return (
    <Suspense fallback={<p aria-busy="true">Loading page…</p>}>
      <Component />
    </Suspense>
  );
}

LazyPage.propTypes = { component: PropTypes.elementType.isRequired };
