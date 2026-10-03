import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  AccountAddressesRoute,
  AccountLayoutPage,
  AccountOrdersRoute,
  AccountPreferencesRoute,
  AdminLayoutPage,
  AdminProductFormRoute,
  AdminProductsRoute,
  CheckoutAddressRoute,
  CheckoutLayoutPage,
  CheckoutPaymentRoute,
  CheckoutReviewRoute,
  LazyPage,
  OrderConfirmationRoute,
} from './lazyPages';
import AppShell from '../components/layout/AppShell';
import CartPage from '../pages/CartPage';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import RouteErrorPage from '../pages/RouteErrorPage';
import WishlistPage from '../pages/WishlistPage';

// we are mapping URLs to components using React Router

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      {
        path: 'checkout',
        element: <LazyPage component={CheckoutLayoutPage} />,
        children: [
          { index: true, element: <Navigate to="address" replace /> },
          { path: 'address', element: <LazyPage component={CheckoutAddressRoute} /> },
          { path: 'payment', element: <LazyPage component={CheckoutPaymentRoute} /> },
          { path: 'review', element: <LazyPage component={CheckoutReviewRoute} /> },
        ],
      },
      { path: 'orders/:orderId', element: <LazyPage component={OrderConfirmationRoute} /> },
      {
        path: 'account',
        element: <LazyPage component={AccountLayoutPage} />,
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: 'orders', element: <LazyPage component={AccountOrdersRoute} /> },
          { path: 'addresses', element: <LazyPage component={AccountAddressesRoute} /> },
          { path: 'preferences', element: <LazyPage component={AccountPreferencesRoute} /> },
        ],
      },
      {
        path: 'admin',
        element: <LazyPage component={AdminLayoutPage} />,
        children: [
          { index: true, element: <Navigate to="products" replace /> },
          { path: 'products', element: <LazyPage component={AdminProductsRoute} /> },
          { path: 'products/new', element: <LazyPage component={AdminProductFormRoute} /> },
          { path: 'products/:id/edit', element: <LazyPage component={AdminProductFormRoute} /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
